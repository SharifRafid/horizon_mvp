'use client';

import { useState, useEffect } from 'react';
import Home from "./components/Home";
import ProfilePage from "./components/ProfilePage";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const sections = [
    { id: "content", label: "Content Library", icon: "📚" },
    { id: "map", label: "Connect with Others", icon: "🌎" },
    { id: "passion", label: "Find Your Passion", icon: "✨" },
    { id: "action", label: "Action Hub", icon: "🚀" },
    { id: "chat", label: "Community Chat", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];
  
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
    
    if (touchEnd - touchStart > 100) {
      // Swipe right
      if (currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, sections.length]);
  
  // Update URL hash when section changes
  useEffect(() => {
    window.location.hash = sections[currentSection].id;
  }, [currentSection, sections]);
  
  // Handle hash change from navbar links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const index = sections.findIndex(section => section.id === hash);
      if (index !== -1) {
        setCurrentSection(index);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sections]);
  
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-green-400/30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -500],
              opacity: [0, 0.7, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 10 + 10,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
      
      <div 
        className="h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hidden sm:block fixed top-1/2 left-4 z-40 transform -translate-y-1/2">
          <motion.button 
            onClick={() => currentSection > 0 && setCurrentSection(currentSection - 1)}
            className={`p-3 rounded-full bg-gray-800/90 shadow-lg backdrop-blur-sm border border-green-500/20 ${currentSection === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-700'}`}
            disabled={currentSection === 0}
            aria-label="Previous section"
            whileHover={currentSection > 0 ? { scale: 1.1, x: -3 } : {}}
            whileTap={currentSection > 0 ? { scale: 0.95 } : {}}
          >
            <ChevronLeft className="w-6 h-6 text-green-400" />
          </motion.button>
        </div>
        
        <div className="hidden sm:block fixed top-1/2 right-4 z-40 transform -translate-y-1/2">
          <motion.button 
            onClick={() => currentSection < sections.length - 1 && setCurrentSection(currentSection + 1)}
            className={`p-3 rounded-full bg-gray-800/90 shadow-lg backdrop-blur-sm border border-green-500/20 ${currentSection === sections.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-700'}`}
            disabled={currentSection === sections.length - 1}
            aria-label="Next section"
            whileHover={currentSection < sections.length - 1 ? { scale: 1.1, x: 3 } : {}}
            whileTap={currentSection < sections.length - 1 ? { scale: 0.95 } : {}}
          >
            <ChevronRight className="w-6 h-6 text-green-400" />
          </motion.button>
        </div>
        
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <motion.div 
            className="flex space-x-3 bg-gray-800/80 rounded-full px-5 py-3 shadow-lg backdrop-blur-sm border border-green-500/20"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => setCurrentSection(index)}
                className={`flex items-center justify-center rounded-full transition-all ${currentSection === index ? 'bg-green-500/20 text-green-400 px-4 py-1' : 'text-gray-400 hover:text-gray-200'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Go to ${section.label}`}
              >
                <span className="text-lg">{section.icon}</span>
                {currentSection === index && (
                  <motion.span 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    className="ml-2 whitespace-nowrap overflow-hidden"
                  >
                    {section.label}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full"
          >
            {sections[currentSection].id === "profile" ? (
              <ProfilePage />
            ) : (
              <Home initialSection={sections[currentSection].id} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
