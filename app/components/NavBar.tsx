/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Bell, Settings, LogOut, User, Search, Moon, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';

interface NavbarProps {
  currentSection?: string;
  sections?: Array<{ id: string; label: string; icon: string }>;
  onNavClick?: (sectionId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentSection = "content", 
  sections = [
    { id: "content", label: "Content", icon: "📚" },
    { id: "map", label: "Connect", icon: "🌎" },
    { id: "passion", label: "Passions", icon: "✨" },
    { id: "action", label: "Action", icon: "🚀" },
    { id: "chat", label: "Chat", icon: "💬" }
  ],
  onNavClick 
}) => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  // const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notifications = 3;
  
  // Add onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // You would fetch user profile data here if needed
      // For example: if(currentUser) { fetchUserProfile(currentUser.uid) }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!window) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (onNavClick) {
      onNavClick(sectionId);
    }
    setIsMenuOpen(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
    setOnboardingStep(0);
  };
  
  const nextOnboardingStep = () => {
    if (onboardingStep < sections.length - 1) {
      setOnboardingStep(onboardingStep + 1);
      if (onNavClick) {
        onNavClick(sections[onboardingStep + 1].id);
      }
    } else {
      setShowOnboarding(false);
    }
  };

  // Example achievements
  const achievements = [
    {
      id: 'first_login',
      title: 'First Steps',
      description: 'Log in to the platform for the first time',
      icon: '🚀',
      completed: true
    },
    {
      id: 'complete_profile',
      title: 'Identity Established',
      description: 'Complete your user profile',
      icon: '👤',
      completed: false
    },
    {
      id: 'first_connection',
      title: 'Networker',
      description: 'Connect with another user',
      icon: '��',
      completed: false
    },
    {
      id: 'content_explorer',
      title: 'Knowledge Seeker',
      description: 'View 5 different content pieces',
      icon: '📚',
      progress: 2,
      total: 5,
      completed: false
    }
  ];

  // Achievement notification component
  // const AchievementNotification = ({ achievement, onClose }) => (
  //   <motion.div
  //     initial={{ x: 300, opacity: 0 }}
  //     animate={{ x: 0, opacity: 1 }}
  //     exit={{ x: 300, opacity: 0 }}
  //     className="fixed top-20 right-4 bg-gray-800 border border-green-500/30 rounded-lg shadow-lg p-4 max-w-xs z-50"
  //   >
  //     <div className="flex items-start gap-3">
  //       <div className="text-3xl">{achievement.icon}</div>
  //       <div>
  //         <h3 className="font-bold text-green-400">Achievement Unlocked!</h3>
  //         <p className="font-medium text-white">{achievement.title}</p>
  //         <p className="text-sm text-gray-300">{achievement.description}</p>
  //       </div>
  //     </div>
  //     <button
  //       onClick={onClose}
  //       className="mt-3 w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-colors"
  //     >
  //       Awesome!
  //     </button>
  //   </motion.div>
  // );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full text-white p-4 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-gray-900/90 backdrop-blur-md shadow-lg' : 'bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-800/30'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">Inspire</span>
              <motion.span 
                className="ml-1 text-green-400"
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 5 }}
              >
                ✨
              </motion.span>
            </motion.div>
            
            <div className="hidden md:flex ml-10 space-x-6">
              {sections.map(section => (
                <motion.a 
                  key={section.id}
                  href={`#${section.id}`} 
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`transition-colors flex items-center ${currentSection === section.id ? 'text-green-400 font-semibold' : 'text-gray-300 hover:text-green-300'}`}
                  whileHover={{ y: -2 }}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                  {currentSection === section.id && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="h-1 bg-green-400 rounded-full mt-1 absolute bottom-0 left-0 right-0"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-800/60 border border-green-800/30 rounded-full py-1 px-4 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-40 lg:w-60"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center bg-gray-800/60 px-3 py-1 rounded-full border border-green-800/30"
            >
              <span className="mr-2 text-green-300">Score: {0}</span>
              <span className="text-sm">🏆</span>
            </motion.div>
            
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <button className="text-gray-300 hover:text-green-400 relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </motion.div>
            
            <div className="relative group">
              {user ? (
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  src={"https://randomuser.me/api/portraits/men/1.jpg"} 
                  alt="User" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-400 cursor-pointer"
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-400 cursor-pointer bg-gray-700 flex items-center justify-center"
                  onClick={() => router.push('/profile')}
                >
                  <User className="w-5 h-5 text-green-400" />
                </motion.div>
              )}
              {user && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 text-gray-200 rounded-lg shadow-xl py-2 z-10 hidden group-hover:block border border-green-800/30 backdrop-blur-sm">
                  <div className="px-4 py-3 border-b border-green-800/30">
                    <p className="font-semibold text-green-400 flex items-center">
                      <User className="w-4 h-4 mr-2" /> {user.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-400" onClick={() => router.push('/profile')}>View Profile</p>
                  </div>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-700 flex items-center">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-700 flex items-center">
                    <Moon className="w-4 h-4 mr-2" /> Dark Mode
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Add help button */}
        <button 
          onClick={startOnboarding}
          className="hidden md:flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tour</span>
        </button>
      </motion.nav>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-gray-800 mt-2 border-t border-green-800/30 rounded-b-lg shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {sections.map(section => (
              <a 
                key={section.id}
                href={`#${section.id}`} 
                onClick={(e) => handleNavClick(e, section.id)}
                className={`flex items-center px-3 py-2 rounded-md ${currentSection === section.id ? 'bg-gray-700 text-green-400' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.label}
              </a>
            ))}
            <div className="pt-4 pb-2 border-t border-green-800/30">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src={"https://randomuser.me/api/portraits/men/1.jpg"} alt={user?.displayName || 'User'} />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-green-400">{user?.displayName || 'User'}</div>
                  <div className="text-sm text-gray-400">Score: {0}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Onboarding overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md border border-green-500/30"
          >
            <h3 className="text-xl font-bold text-green-400 mb-2">
              {onboardingStep === 0 ? 'Welcome to Inspire!' : `Discover ${sections[onboardingStep].label}`}
            </h3>
            <p className="text-gray-300 mb-4">
              {onboardingStep === 0 
                ? "Let's take a quick tour to help you get started." 
                : getStepDescription(onboardingStep)}
            </p>
            <div className="flex justify-between">
              <button 
                onClick={() => setShowOnboarding(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={nextOnboardingStep}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                {onboardingStep === sections.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Helper function for onboarding descriptions
const getStepDescription = (step: number) => {
  switch(step) {
    case 0:
      return "Explore our curated library of videos, articles, and books to enhance your knowledge.";
    case 1:
      return "Find and connect with like-minded individuals in your area who share your interests.";
    case 2:
      return "Discover career paths that align with your values, skills, and interests.";
    case 3:
      return "Find resources and organizations where you can make a difference.";
    case 4:
      return "Join conversations with community members who share your passions.";
    default:
      return "";
  }
};

// Example recommendation component
const ContentRecommendations: React.FC<{ userInterests: string[] }> = ({ userInterests }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-green-800/30">
      <h3 className="text-green-400 font-medium mb-3">Recommended for You</h3>
      <div className="space-y-3">
        {userInterests.map((interest, index) => (
          <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0"></div>
            <div>
              <h4 className="text-white font-medium">Top {interest} Resources</h4>
              <p className="text-sm text-gray-400">Curated content based on your interests</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;