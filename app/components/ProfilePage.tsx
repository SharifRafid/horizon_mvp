/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Settings,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ChevronRight,
  Heart,
  Activity,
  Award,
  MapPin,
  LogOut
} from 'lucide-react';
import { AuthMode } from '../utils/types';
import { useRouter } from 'next/navigation';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  GeoPoint 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Define the UserProfile interface
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  score: number;
  level: number;
  joinDate: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  badges: Array<{
    name: string;
    icon: string;
  }>;
  activities: Array<{
    action: string;
    target: string;
    date: string;
  }>;
}

const ProfilePage: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  
  // Set up auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      
      if (currentUser) {
        try {
          console.log("Fetching user profile from Firestore");
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            console.log("User document exists, setting profile");
            const userData = userDoc.data() as Omit<UserProfile, 'uid'>;
            setUserProfile({
              uid: currentUser.uid,
              ...userData
            });
          } else {
            console.log("Creating new user document");
            const defaultProfile: Omit<UserProfile, 'uid'> = {
              name: currentUser.displayName || 'User',
              email: currentUser.email || '',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
              score: 100,
              level: 1,
              joinDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              badges: [
                { name: "New Member", icon: "🌟" }
              ],
              activities: [
                { 
                  action: "Joined", 
                  target: "Inspire", 
                  date: "Just now" 
                }
              ]
            };
            
            await setDoc(userRef, {
              ...defaultProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            setUserProfile({
              uid: currentUser.uid,
              ...defaultProfile
            });
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        console.log("No user, clearing profile");
        setUserProfile(null);
      }
      
      console.log("Setting loading to false");
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);
  
  // Update auth mode based on user state
  useEffect(() => {
    if (user && !loading) {
      console.log("Setting authMode to profile");
      setAuthMode('profile');
    } else if (!user && !loading) {
      console.log("Setting authMode to login");
      setAuthMode('login');
    }
  }, [user, loading]);
  
  // Handle sign in
  const handleSignIn = async (email: string, password: string) => {
    console.log("Sign in attempt");
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in successful:", result.user.uid);
      // Auth state listener will handle the rest
    } catch (error: any) {
      console.error("Error signing in:", error);
      setLoading(false);
      throw error;
    }
  };
  
  // Handle sign up
  const handleSignUp = async (email: string, password: string, name: string) => {
    console.log("Sign up attempt");
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user.uid);
      
      await updateProfile(user, {
        displayName: name
      });
      console.log("Profile updated with display name");
      
      const newUserProfile: Omit<UserProfile, 'uid'> = {
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        score: 100,
        level: 1,
        joinDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        badges: [
          { name: "New Member", icon: "🌟" }
        ],
        activities: [
          { 
            action: "Joined", 
            target: "Inspire", 
            date: "Just now" 
          }
        ]
      };
      
      await setDoc(doc(db, 'users', user.uid), {
        ...newUserProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("User document created in Firestore");
      
      // Auth state listener will handle setting the user and profile
    } catch (error: any) {
      console.error("Error signing up:", error);
      setLoading(false);
      throw error;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      console.log(`Attempting to ${authMode === 'login' ? 'sign in' : 'sign up'}`);
      if (authMode === 'login') {
        await handleSignIn(email, password);
      } else {
        await handleSignUp(email, password, name);
      }
      console.log("Authentication successful");
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError(
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'Invalid email or password'
          : error.code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : error.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email format'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Update user location
  const updateUserLocation = async (latitude: number, longitude: number) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        location: new GeoPoint(latitude, longitude),
        updatedAt: serverTimestamp()
      });
      
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          location: { latitude, longitude }
        });
      }
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  };
  
  // Add points to user
  const addPoints = async (points: number, action?: string, target?: string) => {
    if (!user || !userProfile) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const newScore = userProfile.score + points;
      const newLevel = Math.floor(newScore / 200) + 1;
      
      const updates: Record<string, any> = {
        score: newScore,
        level: newLevel,
        updatedAt: serverTimestamp()
      };
      
      if (action && target) {
        const newActivity = {
          action,
          target,
          date: "Just now"
        };
        
        updates.activities = [
          newActivity,
          ...userProfile.activities.slice(0, 9)
        ];
      }
      
      await updateDoc(userRef, updates);
      
      setUserProfile({
        ...userProfile,
        score: newScore,
        level: newLevel,
        activities: action && target 
          ? [{ action, target, date: "Just now" }, ...userProfile.activities.slice(0, 9)]
          : userProfile.activities
      });
      
    } catch (error) {
      console.error("Error adding points:", error);
    }
  };
  
  // Render auth form
  const renderAuthForm = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gray-800 rounded-lg border border-blue-800/30 p-4"
      >
        <div className="text-center mb-4">
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            {authMode === 'login' ? 'Welcome Back' : 'Join Inspire'}
          </motion.h2>
          <p className="text-gray-400 text-base mt-1">
            {authMode === 'login' 
              ? 'Sign in to continue your journey' 
              : 'Create an account to start making a difference'}
          </p>
        </div>
        
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {authMode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-blue-800/30 rounded-lg py-2.5 px-4 pl-10 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-blue-800/30 rounded-lg py-2.5 px-4 pl-10 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-blue-800/30 rounded-lg py-2.5 px-4 pl-10 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {authMode === 'login' && (
            <div className="text-right">
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
          )}
          
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium shadow-lg text-base disabled:opacity-70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading
              ? 'Please wait...' 
              : authMode === 'login' 
                ? 'Sign In' 
                : 'Create Account'
            }
          </motion.button>
        </form>
        
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-sm">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-blue-800/30">
          <button 
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-blue-400 text-sm flex items-center justify-center w-full"
          >
            Continue as guest <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </motion.div>
    );
  };
  
  // Render profile
  const renderProfile = () => {
    if (loading || !userProfile) return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-blue-400 text-base">Loading profile...</p>
      </div>
    );
    
    // Calculate level progress percentage
    const levelProgress = Math.min(100, ((userProfile.score % 200) / 200) * 100);
    
    // Calculate points needed for next level
    const pointsForNextLevel = 200 - (userProfile.score % 200);
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        <div className="space-y-3">
          {/* Profile Card */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-blue-800/30"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-20 relative">
              {/* Profile Avatar */}
              <div className="absolute -bottom-10 left-4 w-20 h-20 rounded-full border-4 border-gray-800 overflow-hidden">
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Points Badge */}
              <div className="absolute top-4 right-4 bg-gray-900/80 rounded-full px-3 py-1 flex items-center">
                <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-white font-bold text-sm">{userProfile.score} pts</span>
              </div>
            </div>
            
            <div className="pt-12 pb-4 px-4">
              {/* User Info */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
                <p className="text-gray-400 text-sm flex items-center">
                  <Mail className="w-4 h-4 mr-1" /> {userProfile.email}
                </p>
                
                {userProfile.location && (
                  <p className="text-gray-400 text-sm flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" /> 
                    {`${userProfile.location.latitude.toFixed(2)}, ${userProfile.location.longitude.toFixed(2)}`}
                  </p>
                )}
              </div>
              
              {/* Badges */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-blue-400 mb-2">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.badges.map((badge, index) => (
                    <motion.div 
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700/50 rounded-lg px-2 py-1 flex items-center"
                    >
                      <span className="mr-1 text-lg">{badge.icon}</span>
                      <span className="text-sm text-gray-300">{badge.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Recent Activities */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-blue-400 mb-2">Recent Activity</h3>
                {userProfile.activities.slice(0, 2).map((activity, index) => (
                  <motion.div 
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="bg-gray-700/50 rounded-lg p-2 mb-2 flex items-start"
                  >
                    <div className="bg-blue-500/20 rounded-full p-1.5 mr-2">
                      <Heart className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        <span className="text-blue-300">{activity.action}</span> {activity.target}
                      </p>
                      <p className="text-gray-400 text-xs">{activity.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-3 pt-2 border-t border-blue-800/30">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white">{userProfile.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Level</p>
                    <p className="text-white">{userProfile.level}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <motion.button
                  onClick={handleLogout}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium flex items-center justify-center text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4 mr-1" /> Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Activity Feed */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg shadow-lg p-4 border border-blue-800/30"
          >
            <h3 className="text-base font-bold text-blue-400 mb-2 flex items-center">
              <Activity className="w-5 h-5 mr-1" /> Recent Activity
            </h3>
            
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {userProfile.activities.length > 0 ? (
                userProfile.activities.map((activity, index) => (
                  <motion.div 
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                    className="bg-gray-700/50 rounded-lg p-2.5 flex items-start"
                  >
                    <div className="bg-blue-500/20 rounded-full p-1.5 mr-2">
                      <Heart className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        <span className="text-blue-300">{activity.action}</span> {activity.target}
                      </p>
                      <p className="text-gray-400 text-xs">{activity.date}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-400 text-sm">
                  No activities yet. Start exploring!
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-2 border-t border-blue-800/30">
              <h3 className="text-base font-bold text-blue-400 mb-2 flex items-center">
                <Award className="w-5 h-5 mr-1" /> Progress
              </h3>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300 text-sm">Level Progress</span>
                  <span className="text-blue-300 text-sm">
                    {levelProgress.toFixed(0)}% ({pointsForNextLevel} to level {userProfile.level + 1})
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-teal-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Settings Card - Simplified for popup */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg shadow-lg p-4 border border-blue-800/30"
          >
            <h3 className="text-base font-bold text-blue-400 mb-2 flex items-center">
              <Settings className="w-5 h-5 mr-1" /> Quick Settings
            </h3>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h4 className="text-white font-medium mb-2 text-sm">Notification Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox bg-gray-600 border-gray-500 rounded text-blue-500 focus:ring-blue-500 h-4 w-4" defaultChecked />
                  <span className="ml-2 text-gray-300 text-sm">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox bg-gray-600 border-gray-500 rounded text-blue-500 focus:ring-blue-500 h-4 w-4" defaultChecked />
                  <span className="ml-2 text-gray-300 text-sm">Push notifications</span>
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 max-h-[90vh] overflow-y-auto">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          {loading 
            ? 'Loading...' 
            : authMode === 'login' 
              ? 'Sign In' 
              : authMode === 'signup' 
                ? 'Create Account' 
                : 'Your Profile'}
        </motion.h1>
        
        <AnimatePresence mode="wait">
          {authMode === 'profile' ? (
            loading || !userProfile ? (
              <div className="flex justify-center items-center h-24 bg-gray-800 rounded-lg border border-blue-800/30 p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-2 text-blue-400 text-base">Loading profile...</p>
              </div>
            ) : (
              renderProfile()
            )
          ) : (
            renderAuthForm()
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
