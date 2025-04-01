import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Award, Calendar, Activity, Settings, LogOut, ChevronRight, Heart, Star, Trophy, Zap } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'profile';

const ProfilePage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Mock user data
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    joinDate: "January 2023",
    score: 1250,
    level: 7,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    badges: [
      { name: "Early Adopter", icon: <Star className="w-4 h-4" /> },
      { name: "Community Leader", icon: <Trophy className="w-4 h-4" /> },
      { name: "Environmental Hero", icon: <Zap className="w-4 h-4" /> },
    ],
    activities: [
      { action: "Completed challenge", target: "30 Days of Action", date: "2 days ago" },
      { action: "Joined event", target: "Beach Cleanup", date: "1 week ago" },
      { action: "Earned badge", target: "Environmental Hero", date: "2 weeks ago" },
    ]
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log({ email, password, name });
    setAuthMode('profile');
  };
  
  const renderAuthForm = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 border border-green-800/30 max-w-md w-full mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            {authMode === 'login' ? 'Welcome Back' : 'Join Inspire'}
          </motion.h2>
          <p className="text-gray-400 mt-2">
            {authMode === 'login' 
              ? 'Sign in to continue your journey' 
              : 'Create an account to start making a difference'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-green-800/30 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full bg-gray-700 border border-green-800/30 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full bg-gray-700 border border-green-800/30 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <a href="#" className="text-sm text-green-400 hover:text-green-300">Forgot password?</a>
            </div>
          )}
          
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-green-400 hover:text-green-300 font-medium"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-green-800/30">
          <button 
            onClick={() => setAuthMode('profile')}
            className="text-gray-400 hover:text-green-400 text-sm flex items-center justify-center w-full"
          >
            Continue as guest <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </motion.div>
    );
  };
  
  const renderProfile = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-green-800/30"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-500 h-24 relative">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-gray-800 overflow-hidden">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              
              <div className="mt-4 flex justify-center">
                <div className="bg-gray-700/50 rounded-full px-4 py-1 flex items-center">
                  <Trophy className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-green-300">{user.score} points</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center space-x-2">
                {user.badges.map((badge, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ y: -3 }}
                    className="bg-gray-700 rounded-lg p-2 tooltip-container relative group"
                  >
                    <div className="text-green-400">
                      {badge.icon}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {badge.name}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-green-800/30">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white">{user.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Level</p>
                    <p className="text-white">{user.level}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <motion.button
                  onClick={() => setAuthMode('login')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Activity Feed */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-green-800/30 md:col-span-2"
          >
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" /> Recent Activity
            </h3>
            
            <div className="space-y-4">
              {user.activities.map((activity, index) => (
                <motion.div 
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="bg-gray-700/50 rounded-lg p-4 flex items-start"
                >
                  <div className="bg-green-500/20 rounded-full p-2 mr-3">
                    <Heart className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white">
                      <span className="text-green-300">{activity.action}</span> {activity.target}
                    </p>
                    <p className="text-gray-400 text-sm">{activity.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" /> Progress
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Level Progress</span>
                    <span className="text-green-300">65%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Monthly Goal</span>
                    <span className="text-green-300">40%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "40%" }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Settings Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-green-800/30 md:col-span-3"
          >
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" /> Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Notification Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox bg-gray-600 border-gray-500 rounded text-green-500 focus:ring-green-500" defaultChecked />
                    <span className="ml-2 text-gray-300">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox bg-gray-600 border-gray-500 rounded text-green-500 focus:ring-green-500" defaultChecked />
                    <span className="ml-2 text-gray-300">Push notifications</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Privacy Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox bg-gray-600 border-gray-500 rounded text-green-500 focus:ring-green-500" defaultChecked />
                    <span className="ml-2 text-gray-300">Show profile to others</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox bg-gray-600 border-gray-500 rounded text-green-500 focus:ring-green-500" />
                    <span className="ml-2 text-gray-300">Share activity publicly</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <section id="profile" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
        >
          {authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Your Profile'}
        </motion.h1>
        
        <AnimatePresence mode="wait">
          {authMode === 'profile' ? renderProfile() : renderAuthForm()}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProfilePage;
