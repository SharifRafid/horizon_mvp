/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Bell, User, BookOpen, Users, Heart, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';

interface NavbarProps {
  currentSection?: string;
  onNavClick?: (sectionId: string) => void;
  onProfileClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentSection = "content", 
  onNavClick,
  onProfileClick
}) => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifications = 3;
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
    setShowMobileMenu(false);
  };

  const sections = [
    { id: "content", label: "Content", icon: <BookOpen size={18} /> },
    { id: "map", label: "Connect", icon: <Users size={18} /> },
    { id: "passion", label: "Passions", icon: <Heart size={18} /> },
    { id: "action", label: "Action", icon: <Rocket size={18} /> },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Inspire</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => handleNavClick(e, section.id)}
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  currentSection === section.id 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                <span>{section.label}</span>
              </a>
            ))}
          </nav>
          
          {/* Right side - User menu */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            
            {/* Profile Button */}
            <button
              onClick={onProfileClick}
              className={`flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800 transition-colors ${user ? '' : 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium'}`}
            >
              {user ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => handleNavClick(e, section.id)}
                className={`block px-3 py-2 rounded-md ${
                  currentSection === section.id 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{section.icon}</span>
                  <span>{section.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;