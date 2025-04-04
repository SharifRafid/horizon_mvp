'use client';

import { useState, useEffect, useRef, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, BookOpen, Users, Rocket, Heart, ArrowRight, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import CursorEffect from './components/CursorEffect';

// Dynamically import all components with SSR disabled
const Navbar = dynamic(() => import('./components/NavBar'), { ssr: false });
const ProfilePage = dynamic(() => import('./components/ProfilePage'), { ssr: false });
const ContentLibrary = dynamic(() => import('./components/ContentLibrary'), { ssr: false });
const InteractiveMap = dynamic(() => import('./components/InteractiveMap'), { ssr: false });
const FindPassion = dynamic(() => import('./components/FindPassion'), { ssr: false });
const ActionHub = dynamic(() => import('./components/ActionHub'), { ssr: false });
const CommunityChat = dynamic(() => import('./components/CommunityChat'), { ssr: false });

export default function App() {
  const [currentSection, setCurrentSection] = useState("content");
  const [isClient, setIsClient] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showMainContent, setShowMainContent] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [chatRendered, setChatRendered] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const passionRef = useRef<HTMLDivElement | null>(null);
  const actionRef = useRef<HTMLDivElement | null>(null);
  const globalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Apply overflow hidden to body when onboarding is shown
    if (showOnboarding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Render chat component once
    setChatRendered(true);

    return () => {
      document.body.style.overflow = '';
    };
  }, [showOnboarding]);

  const sections = [
    { id: "content", label: "Content", ref: contentRef },
    { id: "map", label: "Connect", ref: mapRef },
    { id: "passion", label: "Passions", ref: passionRef },
    { id: "action", label: "Action", ref: actionRef }
  ];

  // Handle scroll events to update active section
  useEffect(() => {
    if (!isClient || showOnboarding) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for navbar

      for (const section of sections) {
        const element = section.ref.current;
        if (!element) continue;

        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setCurrentSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient, sections, showOnboarding]);

  const handleNavClick = (sectionId: SetStateAction<string>) => {
    setCurrentSection(sectionId);
    const sectionRef = sections.find(s => s.id === sectionId)?.ref;
    if (sectionRef?.current) {
      window.scrollTo({
        top: sectionRef.current.offsetTop - 80, // Offset for navbar
        behavior: 'smooth'
      });
    }
  };

  const handleContinue = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
      setShowMainContent(true);
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    setShowMainContent(true);
  };

  // Location data for the map
  const userLocation = { lat: 40.7128, lng: -74.0060 };
  const nearbyPeople = [
    {
      id: 1,
      lat: 40.71,
      lng: -74.01,
      name: "Sarah",
      status: "Available",
      interests: ["Environment", "Technology"]
    },
    {
      id: 2,
      lat: 40.72,
      lng: -74.00,
      name: "Mike",
      status: "Active",
      interests: ["Education", "Community"]
    },
    {
      id: 3,
      lat: 40.73,
      lng: -74.02,
      name: "Alex",
      status: "Online",
      interests: ["Sustainability", "Innovation"]
    }
  ];

  // Passion data
  const passions = [
    { title: "Environmental Activism", desc: "Fight for a greener planet and sustainable future for all generations." },
    { title: "Social Justice", desc: "Advocate for equality, fairness, and human rights for marginalized communities." },
    { title: "Education", desc: "Help provide quality education and learning opportunities for everyone." },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-gray-200 font-sans antialiased" ref={globalRef}>
      {/* Add Cursor Effect */}
      <CursorEffect />

      {/* Onboarding Experience */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Step 1: Initial Animation */}
            {onboardingStep === 1 && (
              <motion.div className="absolute inset-0 flex items-center justify-center bg-gray-900 overflow-hidden">
                {/* Background Earth Animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),rgba(15,23,42,0)_70%)] opacity-70"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>

                {/* Earth Globe */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                >
                  <div className="relative w-64 h-64 md:w-96 md:h-96">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-teal-400/30 blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />

                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900 to-teal-900 overflow-hidden"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 2,
                        ease: "easeOut"
                      }}
                    >
                      <div className="absolute inset-0 bg-[url('/api/placeholder/800/800')] bg-cover opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-bl from-teal-400/20 to-transparent" />

                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 60,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-80" />
                        <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full opacity-80" />
                        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white rounded-full opacity-60" />
                        <div className="absolute top-1/5 right-1/4 w-1 h-1 bg-white rounded-full opacity-80" />
                        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white rounded-full opacity-70" />
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Inspire Text */}
                <motion.div
                  className="relative z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                >
                  <motion.h1
                    className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 relative z-10 tracking-tight"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Inspire
                  </motion.h1>
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  onClick={handleContinue}
                  className="absolute bottom-12 px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white rounded-full font-medium flex items-center justify-center group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Skip Button */}
                <motion.button
                  onClick={skipOnboarding}
                  className="absolute bottom-4 text-gray-400 hover:text-white text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 2.5, duration: 0.6 }}
                >
                  Skip
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Purpose & Features */}
            {onboardingStep === 2 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gray-900 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                  <motion.div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),rgba(15,23,42,0)_70%)]"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  {/* Animated Lines */}
                  <div className="absolute inset-0 opacity-10">
                    <motion.div
                      className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                      animate={{
                        left: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.div
                      className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-teal-400 to-transparent"
                      animate={{
                        top: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 1
                      }}
                    />
                    <motion.div
                      className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                      animate={{
                        right: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 2
                      }}
                    />
                    <motion.div
                      className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-teal-400 to-transparent"
                      animate={{
                        top: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 3
                      }}
                    />
                  </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                  <motion.div
                    className="backdrop-blur-sm bg-gray-900/60 p-8 rounded-2xl border border-gray-700/50 overflow-hidden"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

                    <motion.h2
                      className="text-3xl md:text-4xl font-bold text-white mb-6 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Your journey to making a difference
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          icon: <BookOpen className="w-8 h-8" />,
                          title: "Learn",
                          desc: "Discover resources that inspire change",
                          gradient: "from-blue-500/20 to-blue-600/20"
                        },
                        {
                          icon: <Users className="w-8 h-8" />,
                          title: "Connect",
                          desc: "Join a community of changemakers",
                          gradient: "from-teal-500/20 to-teal-600/20"
                        },
                        {
                          icon: <Rocket className="w-8 h-8" />,
                          title: "Act",
                          desc: "Transform inspiration into real impact",
                          gradient: "from-blue-500/20 to-teal-500/20"
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all group relative overflow-hidden"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.2 }}
                          whileHover={{ y: -5 }}
                        >
                          {/* Animated gradient background */}
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-30 transition-opacity`}
                            animate={{
                              backgroundPosition: ["0% 0%", "100% 100%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }}
                          />

                          <div className="bg-gradient-to-br from-blue-500/20 to-teal-400/20 p-3 rounded-lg w-fit mb-4 group-hover:from-blue-500/30 group-hover:to-teal-400/30 transition-all relative z-10">
                            <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                              {item.icon}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-blue-300 mb-2 relative z-10">{item.title}</h3>
                          <p className="text-gray-400 relative z-10">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 flex justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <motion.button
                        onClick={handleContinue}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white rounded-lg font-medium flex items-center justify-center group transition-all relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10">Continue</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />

                        {/* Button animation */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                          }}
                        />
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Skip Button */}
                <motion.button
                  onClick={skipOnboarding}
                  className="absolute bottom-4 text-gray-400 hover:text-white text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  Skip
                </motion.button>
              </motion.div>
            )}

            {/* Step 3: Ready to Start */}
            {onboardingStep === 3 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gray-900 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                  <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.1),rgba(15,23,42,0)_70%)]"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  {/* Particle Effect */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        initial={{
                          x: Math.random() * 100 + "%",
                          y: Math.random() * 100 + "%",
                          opacity: 0.1 + Math.random() * 0.3
                        }}
                        animate={{
                          y: [null, "-20vh"],
                          opacity: [null, 0]
                        }}
                        transition={{
                          duration: 3 + Math.random() * 5,
                          repeat: Infinity,
                          delay: Math.random() * 10,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i + 20}
                        className="absolute w-1 h-1 bg-teal-400 rounded-full"
                        initial={{
                          x: Math.random() * 100 + "%",
                          y: Math.random() * 100 + "%",
                          opacity: 0.1 + Math.random() * 0.3
                        }}
                        animate={{
                          y: [null, "-20vh"],
                          opacity: [null, 0]
                        }}
                        transition={{
                          duration: 3 + Math.random() * 5,
                          repeat: Infinity,
                          delay: Math.random() * 10,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="max-w-4xl w-full px-6 relative z-10">
                  <motion.div
                    className="backdrop-blur-md bg-gray-900/60 p-8 rounded-2xl border border-gray-700/50"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/30 to-teal-400/30 rounded-full flex items-center justify-center mb-4 relative overflow-hidden"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-teal-500/30"
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        <Heart className="w-8 h-8 text-blue-400 relative z-10" />
                      </motion.div>

                      <motion.h2
                        className="text-3xl font-bold text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Ready to get started?
                      </motion.h2>

                      <motion.p
                        className="text-gray-400 mt-2 max-w-lg mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        Join thousands of changemakers who are turning their passion into positive impact.
                      </motion.p>
                    </div>

                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      {[
                        {
                          title: "Join the community",
                          desc: "Connect with like-minded individuals",
                          gradient: "from-blue-500/10 to-blue-700/10"
                        },
                        {
                          title: "Take action today",
                          desc: "Find opportunities to make an impact",
                          gradient: "from-teal-500/10 to-teal-700/10"
                        }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 relative overflow-hidden group"
                          whileHover={{ y: -5 }}
                        >
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                            animate={{
                              backgroundPosition: ["0% 0%", "100% 100%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }}
                          />

                          <div className="flex items-center relative z-10">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mr-4">
                              <div className="w-16 h-16 bg-gray-800 flex items-center justify-center text-2xl">
                                {i === 0 ? "👥" : "🚀"}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-blue-300">{item.title}</h3>
                              <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <motion.button
                        onClick={handleContinue}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white rounded-lg font-medium flex items-center justify-center group transition-all relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10">Get Started</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />

                        {/* Button animation */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          // transition={{
                          //   duration: 1.5,
                          //   repeat: Infinity, x: ["-100%", "100%"],
                          // }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                          }}
                        />
                      </motion.button>

                      <button
                        onClick={() => {
                          setShowOnboarding(false);
                          setShowProfile(true);
                          setShowMainContent(true);
                        }}
                        className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Landing Page */}
      {showMainContent && (
        <div className="min-h-screen flex flex-col">
          {/* Navbar */}
          <Navbar
            currentSection={currentSection}
            onNavClick={handleNavClick}
            onProfileClick={() => setShowProfile(true)}
          />

          {/* Hero Section */}
          <section className="min-h-screen w-full flex items-center justify-center relative overflow-hidden pt-16">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),rgba(15,23,42,0)_50%)]"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900 to-transparent"
              />

              {/* Animated Grid Lines */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full grid grid-cols-6 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-full w-px bg-blue-400 ml-auto" />
                  ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-6 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="w-full h-px bg-blue-400" />
                  ))}
                </div>
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                      opacity: 0.1 + Math.random() * 0.3,
                      scale: 0.2 + Math.random() * 1.5
                    }}
                    animate={{
                      y: [null, `${-15 - Math.random() * 15}%`],
                      opacity: [null, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 7,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                      ease: "easeOut"
                    }}
                  />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i + 30}
                    className="absolute w-1 h-1 bg-teal-400 rounded-full"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                      opacity: 0.1 + Math.random() * 0.3,
                      scale: 0.2 + Math.random() * 1.5
                    }}
                    animate={{
                      y: [null, `${-15 - Math.random() * 15}%`],
                      opacity: [null, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 7,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hero Content */}
            <div className="container mx-auto px-6 z-10 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center lg:text-left"
                >
                  <div className="inline-block mb-4 px-4 py-1 rounded-full bg-gradient-to-r from-blue-900/40 to-teal-900/40 border border-blue-500/20 backdrop-blur-sm">
                    <span className="text-blue-400 text-sm font-medium">Make a difference today</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    <span className="text-white">Turn Your Passion Into </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                      Positive Impact
                    </span>
                  </h1>

                  <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                    Join a community of changemakers who are transforming their ideas and passions into meaningful action for a better world.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.button
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white rounded-lg font-medium flex items-center justify-center group relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavClick('passion')}
                    >
                      <span className="relative z-10">Find Your Passion</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />

                      {/* Button animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                          repeatType: "loop"
                        }}
                      />
                    </motion.button>

                    <button
                      className="px-8 py-3 bg-transparent hover:bg-gray-800 text-white rounded-lg font-medium border border-blue-500/30 hover:border-blue-500/50 transition-colors"
                      onClick={() => handleNavClick('map')}
                    >
                      Explore Community
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="relative"
                >
                  {/* 3D Globe Visualization */}
                  <div className="relative w-full h-64 md:h-96 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-400/10 rounded-full blur-3xl" />

                    <motion.div
                      className="relative w-48 h-48 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden"
                      animate={{
                        rotateY: 360,
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {/* World Map Grid */}
                      <div className="absolute inset-0 bg-[url('/api/placeholder/500/500')] bg-cover opacity-20" />

                      {/* Connection Points & Lines */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute rounded-full bg-blue-400"
                            style={{
                              top: `${20 + Math.random() * 60}%`,
                              left: `${20 + Math.random() * 60}%`,
                              width: `${2 + Math.random() * 4}px`,
                              height: `${2 + Math.random() * 4}px`,
                            }}
                            animate={{
                              opacity: [0.4, 0.8, 0.4],
                              scale: [1, 1.5, 1],
                            }}
                            transition={{
                              duration: 2 + Math.random() * 3,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: Math.random() * 2
                            }}
                          />
                        ))}

                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full opacity-30">
                          <motion.path
                            d="M30,30 Q90,10 150,50"
                            stroke="url(#blue-gradient)"
                            strokeWidth="1"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 0.5 }}
                          />
                          <motion.path
                            d="M40,100 Q100,120 160,90"
                            stroke="url(#teal-gradient)"
                            strokeWidth="1"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1 }}
                          />
                          <motion.path
                            d="M100,40 Q120,100 80,150"
                            stroke="url(#blue-gradient)"
                            strokeWidth="1"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1.5 }}
                          />
                          <defs>
                            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#60A5FA" />
                            </linearGradient>
                            <linearGradient id="teal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2DD4BF" />
                              <stop offset="100%" stopColor="#5EEAD4" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-bl from-teal-400/20 to-transparent" />
                    </motion.div>

                    {/* Orbiting Elements */}
                    <motion.div
                      className="absolute w-full h-full"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-8 h-8 bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-full flex items-center justify-center"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <span className="text-blue-300 text-lg">🌊</span>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="absolute w-full h-full"
                      animate={{
                        rotate: -360,
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-8 h-8 bg-gradient-to-br from-teal-500/30 to-teal-700/30 rounded-full flex items-center justify-center"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 1
                        }}
                      >
                        <span className="text-teal-300 text-lg">🌱</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Scroll Indicator */}
              <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <span className="text-gray-400 text-sm mb-2">Scroll to explore</span>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <ChevronDown className="text-blue-400 w-6 h-6" />
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Main Content Sections */}
          <div className="flex-1">
            {/* Content Library Section */}
            <section
              id="content"
              ref={contentRef}
              className="min-h-screen py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),rgba(15,23,42,0)_70%)]"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>

              <div className="container mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <ContentLibrary />
                </motion.div>
              </div>
            </section>

            {/* Connect Section */}
            <section
              id="map"
              ref={mapRef}
              className="min-h-screen py-16 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.1),rgba(15,23,42,0)_70%)]"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>

              <div className="container mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <InteractiveMap userLocation={userLocation} nearbyPeople={nearbyPeople} />
                </motion.div>
              </div>
            </section>

            {/* Passions Section */}
            <section
              id="passion"
              ref={passionRef}
              className="min-h-screen py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),rgba(15,23,42,0)_70%)]"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>

              <div className="container mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FindPassion passions={passions} />
                </motion.div>
              </div>
            </section>

            {/* Action Hub Section */}
            <section
              id="action"
              ref={actionRef}
              className="min-h-screen py-16 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.1),rgba(15,23,42,0)_70%)]"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>

              <div className="container mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <ActionHub />
                </motion.div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-gray-900 border-t border-gray-800 py-8 relative z-10">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Inspire</h3>
                  <p className="text-gray-400 mb-4">Making a difference, one action at a time.</p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      <span className="sr-only">Facebook</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      <span className="sr-only">Instagram</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 3.808-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-3.808-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#content" className="hover:text-blue-300 transition-colors">Content Library</a></li>
                    <li><a href="#map" className="hover:text-blue-300 transition-colors">Connect</a></li>
                    <li><a href="#passion" className="hover:text-blue-300 transition-colors">Find Your Passion</a></li>
                    <li><a href="#action" className="hover:text-blue-300 transition-colors">Take Action</a></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Community Guidelines</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Success Stories</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Events</a></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Stay Connected</h3>
                  <p className="text-gray-400 mb-4">Subscribe to our newsletter for updates.</p>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="bg-gray-800 rounded-l-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 flex-grow"
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg px-4 py-2 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Inspire. All rights reserved.</p>
              </div>
            </div>
          </footer>

          {/* Chat Button */}
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 flex items-center justify-center shadow-lg transition-all hover:scale-105"
            >
              {showChat ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <MessageCircle className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Chat Panel - Render once and toggle visibility */}
          {chatRendered && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={showChat ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-24 right-6 w-96 md:w-[450px] h-[500px] bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden z-30"
              style={{ display: showChat ? 'block' : 'none' }}
            >
              <CommunityChat />
            </motion.div>
          )}

          {/* Profile Panel */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 shadow-2xl border-l border-gray-800 z-50 overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Your Profile</h2>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <ProfilePage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}