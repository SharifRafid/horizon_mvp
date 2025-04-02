'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, BookOpen, Users, Rocket } from 'lucide-react';
import dynamic from 'next/dynamic';

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
  const [showWelcome, setShowWelcome] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const passionRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sections = [
    { id: "content", label: "Content", ref: contentRef },
    { id: "map", label: "Connect", ref: mapRef },
    { id: "passion", label: "Passions", ref: passionRef },
    { id: "action", label: "Action", ref: actionRef }
  ];

  useEffect(() => {
    if (!isClient) return;

    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (hasVisitedBefore) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
    }

    // Handle scroll events to update active section
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
  }, [isClient, sections]);

  const handleNavClick = (sectionId: string) => {
    setCurrentSection(sectionId);
    const sectionRef = sections.find(s => s.id === sectionId)?.ref;
    if (sectionRef?.current) {
      window.scrollTo({
        top: sectionRef.current.offsetTop - 80, // Offset for navbar
        behavior: 'smooth'
      });
    }
  };

  if (!isClient) {
    return null;
  }

  const videos = [
    { title: "Inspirational Talk", url: "https://youtube.com/embed/dQw4w9WgXcQ", link: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Motivational Speech", url: "https://youtube.com/embed/dQw4w9WgXcQ", link: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Success Story", url: "https://youtube.com/embed/dQw4w9WgXcQ", link: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
  ];
  const tiktoks = [
    { title: "Quick Motivation", url: "https://www.tiktok.com/embed/v2/123456", link: "https://tiktok.com/@user/123456" },
    { title: "Life Hack", url: "https://www.tiktok.com/embed/v2/123456", link: "https://tiktok.com/@user/123456" },
  ];
  const books = [
    { title: "The Power of Now", url: "https://example.com/book1.pdf", cover: "https://picsum.photos/200/300" },
    { title: "Atomic Habits", url: "https://example.com/book2.pdf", cover: "https://picsum.photos/200/300" },
  ];
  const articles = [
    { title: "Change the World", url: "https://medium.com/article1", preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..." },
    { title: "Finding Purpose", url: "https://medium.com/article2", preview: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..." },
  ];
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
  const passions = [
    { title: "Environmental Activism", desc: "Fight for a greener planet and sustainable future for all generations." },
    { title: "Social Justice", desc: "Advocate for equality, fairness, and human rights for marginalized communities." },
    { title: "Education", desc: "Help provide quality education and learning opportunities for everyone." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 font-sans antialiased">
      {/* Welcome modal for first-time users */}
      {showWelcome && isClient && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 max-w-md border border-blue-500/30"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <span className="text-blue-400 text-2xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-blue-400 mt-2">Welcome to Inspire</h2>
              <p className="text-gray-300 mt-2">Your journey to making a difference starts here.</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-300">Learn</h3>
                  <p className="text-sm text-gray-400">Explore our content library with curated resources</p>
                </div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-300">Connect</h3>
                  <p className="text-sm text-gray-400">Find like-minded people in your area</p>
                </div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <Rocket className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-300">Take Action</h3>
                  <p className="text-sm text-gray-400">Make a real difference in your community</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>

              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-gray-400 text-sm">Already have an account?</span>
                <button
                  onClick={() => {
                    setShowWelcome(false);
                    setShowProfile(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentSection={currentSection}
        onNavClick={handleNavClick}
        onProfileClick={() => setShowProfile(true)}
      />

      {/* Main Content - Vertical Scrolling */}
      <div className="pt-16 pb-16">
        {/* Content Library Section */}
        <section
          id="content"
          ref={contentRef}
          className="min-h-screen py-16"
        >
          <ContentLibrary videos={videos} tiktoks={tiktoks} books={books} articles={articles} />
        </section>

        {/* Connect Section */}
        <section
          id="map"
          ref={mapRef}
          className="min-h-screen py-16"
        >
          <InteractiveMap userLocation={userLocation} nearbyPeople={nearbyPeople} />
        </section>

        {/* Passions Section */}
        <section
          id="passion"
          ref={passionRef}
          className="min-h-screen py-16"
        >
          <FindPassion passions={passions} />
        </section>

        {/* Action Hub Section */}
        <section
          id="action"
          ref={actionRef}
          className="min-h-screen py-16"
        >
          <ActionHub />
        </section>
      </div>

      {/* Chat Bottom Bar Button - Only visible when chat is not shown */}
      {!showChat && (
        <div className="fixed bottom-0 right-0 z-40">
          <button
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 
                 text-white py-3 px-24 flex items-center justify-center shadow-lg 
                 rounded-tl-2xl"
          >
            <MessageCircle size={20} className="mr-2" />
            <span className="font-medium">Community Chat</span>
          </button>
        </div>
      )}

      {/* Chat Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 w-full md:w-1/3 h-[80vh] z-30 bg-gray-900 rounded-t-xl shadow-xl border-t border-l border-blue-500/30"
          >
            <div className="absolute top-0 right-0 p-2">
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <CommunityChat onClose={() => setShowChat(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-gray-900 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>
              <ProfilePage />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}