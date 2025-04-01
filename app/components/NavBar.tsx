// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Bell, Settings, LogOut, User, Search, Moon } from 'lucide-react';

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
  const user = {
    name: "Alex",
    score: 1250,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notifications = 3;
  
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

  return (
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
            <span className="mr-2 text-green-300">Score: {user.score}</span>
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
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={user.avatar} 
              alt="User" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-400 cursor-pointer"
            />
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 text-gray-200 rounded-lg shadow-xl py-2 z-10 hidden group-hover:block border border-green-800/30 backdrop-blur-sm">
              <div className="px-4 py-3 border-b border-green-800/30">
                <p className="font-semibold text-green-400 flex items-center">
                  <User className="w-4 h-4 mr-2" /> {user.name}
                </p>
                <p className="text-sm text-gray-400">View Profile</p>
              </div>
              <a href="#" className="block px-4 py-2 hover:bg-gray-700 flex items-center">
                <Settings className="w-4 h-4 mr-2" /> Settings
              </a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-700 flex items-center">
                <Moon className="w-4 h-4 mr-2" /> Dark Mode
              </a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-700 flex items-center">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </a>
            </div>
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
                  <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-green-400">{user.name}</div>
                  <div className="text-sm text-gray-400">Score: {user.score}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;