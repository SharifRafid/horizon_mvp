/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ContentLibrary.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube,
  Video,
  BookOpen,
  FileText,
  MessageCircle,
  RefreshCw,
  Check as CheckIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ContentItem {
  id?: string;
  title: string;
  url: string;
  type: string;
  thumbnail?: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  preview?: string;
  cover?: string;
  link?: string;
}

interface ContentLibraryProps {
  videos?: Array<any>;
  tiktoks?: Array<any>;
  books?: Array<any>;
  articles?: Array<any>;
}

const ContentLibrary: React.FC<ContentLibraryProps> = () => {
  // const [activeTab, setActiveTab] = useState('all');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  // const isTablet = useMediaQuery('(max-width: 1024px)');

  // Load completed content from localStorage
  useEffect(() => {
    const savedCompleted = localStorage.getItem('completedContent');
    if (savedCompleted) {
      setCompletedContent(JSON.parse(savedCompleted));
    }
  }, []);

  // Fetch content from Firestore
  const fetchContentFromFirestore = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const contentCollection = collection(db, 'content');
      const contentQuery = query(contentCollection, orderBy('createdAt', 'desc'));
      const contentSnapshot = await getDocs(contentQuery);
      
      if (contentSnapshot.empty) {
        // If no content in Firestore, trigger API to fetch new content
        await refreshContent();
        return;
      }
      
      const contentItems = contentSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ContentItem[];
      
      setContent(contentItems);
      console.log('Content fetched from Firestore:', contentItems.length, 'items');
    } catch (err) {
      setError('Failed to fetch content. Please try again later.');
      console.error('Error fetching content from Firestore:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh content by calling the API
  const refreshContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content');

      if (!response.ok) {
        throw new Error('Failed to refresh content');
      }

      // After API updates Firestore, fetch the updated content
      await fetchContentFromFirestore();
    } catch (err) {
      setError('Failed to refresh content. Please try again later.');
      console.error('Error refreshing content:', err);
      setIsLoading(false);
    }
  };

  // Initial content fetch
  useEffect(() => {
    fetchContentFromFirestore();
  }, []);

  // Mark content as completed
  const markAsCompleted = (id: string) => {
    setCompletedContent(prev => {
      const newCompleted = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id];

      // Save to localStorage
      localStorage.setItem('completedContent', JSON.stringify(newCompleted));
      return newCompleted;
    });
  };

  // Get content type icon
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Youtube className="w-4 h-4" />;
      case 'tiktok':
        return <Video className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Scroll tabs left
  const scrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // Scroll tabs right
  const scrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Section Title with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent inline-block mb-4">
            Discover Inspiring Content
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore curated resources to help you learn, grow, and make a difference.
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
              </div>
              <p className="ml-3 text-blue-400">Loading content...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Content */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Featured Content
              </h2>
            </div>
            <motion.button
              onClick={refreshContent}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors relative overflow-hidden group"
              aria-label="Refresh content"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-400/20 opacity-0 group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <RefreshCw className="w-5 h-5 relative z-10" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {content.map((item, index) => (
              <motion.div
                key={item.id || `${item.type}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                  transition: { duration: 0.2 } 
                }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group"
              >
                <div className="relative h-40">
                  <img
                    src={item.thumbnail || 'https://picsum.photos/600/400?random=' + Math.random()}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  
                  {/* Hover overlay with animation */}
                  <motion.div 
                    className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                    whileHover={{
                      background: [
                        "rgba(59, 130, 246, 0.1)",
                        "rgba(45, 212, 191, 0.1)",
                        "rgba(59, 130, 246, 0.1)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center">
                      <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        {getContentIcon(item.type)}
                        <span className="ml-1 capitalize">{item.type}</span>
                      </span>
                      {completedContent.includes(item.id || item.title) && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center"
                        >
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Completed
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <motion.a
                      href={item.url || item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center group"
                      whileHover={{ x: 3 }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                      View
                    </motion.a>
                    <motion.button
                      onClick={() => markAsCompleted(item.id || item.title)}
                      className="text-xs text-gray-400 hover:text-blue-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {completedContent.includes(item.id || item.title) ? "Completed" : "Mark Complete"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Videos Carousel - with improved mobile responsiveness */}
        {content.filter(item => item.type === 'video').length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent flex items-center">
                <Youtube className="w-6 h-6 mr-2 text-blue-500" />
                Videos
              </h2>
              {!isMobile && (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={scrollLeft}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                    aria-label="Scroll left"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={scrollRight}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                    aria-label="Scroll right"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            <div
              ref={tabsContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x"
            >
              {content.filter(item => item.type === 'video').map((item, index) => (
                <motion.div
                  key={item.id || `video-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                    transition: { duration: 0.2 } 
                  }}
                  className={`flex-shrink-0 ${isMobile ? 'w-[85vw]' : 'w-64'} bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group snap-start`}
                >
                  <div className="relative pt-[56.25%]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-blue-500/80 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform">
                        <Youtube className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                      >
                        Watch Video
                      </a>
                      <button
                        onClick={() => markAsCompleted(item.id || item.title)}
                        className="text-xs text-gray-400 hover:text-blue-300"
                      >
                        {completedContent.includes(item.id || item.title) ? "✓" : "Mark"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Short Videos Carousel */}
        {content.filter(item => item.type === 'tiktok').length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent flex items-center">
                <Video className="w-6 h-6 mr-2 text-blue-500" />
                Short Videos
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={scrollLeft}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={tabsContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x"
            >
              {content.filter(item => item.type === 'tiktok').map((item, index) => (
                <motion.div
                  key={item.id || `tiktok-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="flex-shrink-0 w-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group snap-start"
                >
                  <div className="relative pt-[177%]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-blue-500/80 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform">
                        <Video className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white mb-2 line-clamp-1">{item.title}</h3>
                    <div className="flex justify-between items-center">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                      >
                        Watch
                      </a>
                      <button
                        onClick={() => markAsCompleted(item.id || item.title)}
                        className="text-xs text-gray-400 hover:text-blue-300"
                      >
                        {completedContent.includes(item.id || item.title) ? "✓" : "Mark"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Books Carousel */}
        {content.filter(item => item.type === 'book').length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
                Books
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={scrollLeft}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={tabsContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x"
            >
              {content.filter(item => item.type === 'book').map((item, index) => (
                <motion.div
                  key={item.id || `book-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                    transition: { duration: 0.2 }
                  }}
                  className="flex-shrink-0 w-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group snap-start"
                >
                  <div className="relative pt-[140%]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500/90 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0"
                        >
                          View Book
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-1">{item.author}</p>
                    <button
                      onClick={() => markAsCompleted(item.id || item.title)}
                      className="text-xs text-gray-400 hover:text-blue-300 w-full text-left"
                    >
                      {completedContent.includes(item.id || item.title) ? "Completed ✓" : "Mark as read"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Articles Carousel */}
        {content.filter(item => item.type === 'article').length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-500" />
                Articles
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={scrollLeft}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={tabsContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x"
            >
              {content.filter(item => item.type === 'article').map((item, index) => (
                <motion.div
                  key={item.id || `article-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="flex-shrink-0 w-72 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group snap-start"
                >
                  <div className="relative h-32">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{item.preview}</p>
                    <div className="flex justify-between items-center">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                      >
                        Read Article
                      </a>
                      <button
                        onClick={() => markAsCompleted(item.id || item.title)}
                        className="text-xs text-gray-400 hover:text-blue-300"
                      >
                        {completedContent.includes(item.id || item.title) ? "✓" : "Mark"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State with improved animation */}
        {content.length === 0 && !isLoading && (
          <motion.div 
            className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto p-6">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-teal-400/20 flex items-center justify-center"
              >
                <RefreshCw className="w-10 h-10 text-blue-400" />
              </motion.div>
              
              <p className="text-gray-400 text-lg mb-6">
                No content available. Click the refresh button to fetch latest content.
              </p>
              
              <motion.button
                onClick={refreshContent}
                className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg flex items-center gap-2 mx-auto relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-teal-500/30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Fetch Content</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom CSS for scrollbar hiding */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Add smooth hover transitions */
        .group {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        /* Improve mobile touch experience */
        @media (max-width: 768px) {
          .snap-x > * {
            scroll-snap-align: center;
          }
        }
      `}</style>
    </section>
  );
};

export default ContentLibrary;