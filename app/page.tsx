'use client';

import { useState, useEffect, useMemo } from 'react';
import ProfilePage from "./components/ProfilePage";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Users, Rocket } from 'lucide-react';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('./components/Home'), {
  ssr: false,
});

export default function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  // const [userPreferences, setUserPreferences] = useState({
  //   theme: 'dark',
  //   notifications: true,
  //   autoplay: false
  // });
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sections = useMemo(() => [
    { id: "content", label: "Content Library", icon: "📚" },
    { id: "map", label: "Connect with Others", icon: "🌎" },
    { id: "passion", label: "Find Your Passion", icon: "✨" },
    { id: "action", label: "Action Hub", icon: "🚀" },
    { id: "chat", label: "Community Chat", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" }
  ], []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }

    if (touchEnd - touchStart > 100) {
      if (currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    };
    if (!window) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, sections.length]);

  useEffect(() => {
    if (isClient) {
      if (!window) return;
      window.location.hash = sections[currentSection].id;
    }
  }, [currentSection, sections, isClient]);

  useEffect(() => {
    if (isClient) {
      if (!window) return;
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '');
        const index = sections.findIndex(section => section.id === hash);
        if (index !== -1) {
          setCurrentSection(index);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [sections, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (hasVisitedBefore) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-green-400/30"
            initial={{
              x: isClient ? Math.random() * (window ? window.innerWidth : 100) : 0,
              y: isClient ? Math.random() * (window ? window.innerHeight : 100) : 0,
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

      {/* Welcome modal for first-time users */}
      {showWelcome && isClient && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 max-w-md border border-green-500/30"
          >
            <div className="text-center mb-6">
              <span className="text-4xl">✨</span>
              <h2 className="text-2xl font-bold text-green-400 mt-2">Welcome to Inspire</h2>
              <p className="text-gray-300 mt-2">Your journey to making a difference starts here.</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-green-300">Learn</h3>
                  <p className="text-sm text-gray-400">Explore our content library with curated resources</p>
                </div>
              </div>
              
              <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-green-300">Connect</h3>
                  <p className="text-sm text-gray-400">Find like-minded people in your area</p>
                </div>
              </div>
              
              <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Rocket className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-green-300">Take Action</h3>
                  <p className="text-sm text-gray-400">Make a real difference in your community</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowWelcome(false)}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-gray-400 text-sm">Already have an account?</span>
                <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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