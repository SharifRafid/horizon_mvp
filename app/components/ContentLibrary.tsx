/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ContentLibrary.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

const ContentLibrary: React.FC<ContentLibraryProps> = ({ videos = [], tiktoks = [], books = [], articles = [] }) => {
  // const [activeTab, setActiveTab] = useState('all');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Initialize content from props
  useEffect(() => {
    const initialContent = [
      ...videos.map(item => ({ ...item, type: 'video', thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.url.split('/').pop()}/hqdefault.jpg` })),
      ...tiktoks.map(item => ({ ...item, type: 'tiktok', thumbnail: 'https://picsum.photos/300/500?random=' + Math.random() })),
      ...books.map(item => ({ ...item, type: 'book', thumbnail: item.cover })),
      ...articles.map(item => ({ ...item, type: 'article', thumbnail: 'https://picsum.photos/600/400?random=' + Math.random() }))
    ];

    setContent(initialContent);

    // Load completed content from localStorage
    const savedCompleted = localStorage.getItem('completedContent');
    if (savedCompleted) {
      setCompletedContent(JSON.parse(savedCompleted));
    }
  }, [videos, tiktoks, books, articles]);

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

  // Fetch content from API
  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content');

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();

      // Combine all content types
      const allContent = [
        ...data.videos.map((item: any) => ({ ...item, type: 'video' })),
        ...data.tiktoks.map((item: any) => ({ ...item, type: 'tiktok' })),
        ...data.articles.map((item: any) => ({ ...item, type: 'article' })),
        ...data.books.map((item: any) => ({ ...item, type: 'book' }))
      ];

      setContent(allContent);
      console.log('Content fetched from API:', allContent.length, 'items');
    } catch (err) {
      setError('Failed to fetch content. Please try again later.');
      console.error('Error fetching content:', err);
    } finally {
      setIsLoading(false);
    }
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
        {/* Animated Title */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block"
          >
            {/* Subtle floating elements in background */}
            <motion.div
              className="absolute -z-10 inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Abstract shapes that float in background */}
              <div className="absolute top-0 -left-16 w-12 h-12 rounded-full bg-blue-500/10"
                style={{ animation: "float 8s ease-in-out infinite" }} />
              <div className="absolute bottom-8 -right-10 w-8 h-8 rounded-full bg-teal-400/10"
                style={{ animation: "float 6s ease-in-out infinite reverse" }} />
              <div className="absolute top-10 right-0 w-4 h-4 rounded-sm bg-blue-400/10"
                style={{ animation: "float 7s ease-in-out infinite 1s" }} />
            </motion.div>

            {/* Main heading with icon */}
            <div className="flex justify-center items-center mb-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="mr-3 text-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </motion.span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent relative z-10">
                Unlock Your Potential
              </h1>
            </div>

            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-3 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/20 to-teal-400/20 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </motion.div>

          {/* Tagline with better copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg"
          >
            Dive into our expertly curated resources that transform curiosity into mastery.
            Join thousands already changing their future through knowledge.
          </motion.p>

          {/* Featured benefits with icons */}
          <motion.div
            className="grid grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-medium text-gray-300">Expert-Led Content</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-400/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-300">Personalized Learning</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-300">Community Support</span>
            </div>
          </motion.div>

          {/* Call to action button with hover animation */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full text-white font-medium transition-transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 group">
              Start Your Journey
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        </div>


        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-blue-400">Loading content...</p>
          </div>
        )}

        {/* Featured Content */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Featured Content
              </h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchContent()}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-full transition-colors"
                aria-label="Refresh content"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {content.map((item, index) => (
              <motion.div
                key={item.id || `${item.type}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group"
              >
                <div className="relative h-40">
                  <img
                    src={item.thumbnail || 'https://picsum.photos/600/400?random=' + Math.random()}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center">
                      <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        {getContentIcon(item.type)}
                        <span className="ml-1 capitalize">{item.type}</span>
                      </span>
                      {completedContent.includes(item.id || item.title) && (
                        <span className="ml-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <a
                      href={item.url || item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </a>
                    <button
                      onClick={() => markAsCompleted(item.id || item.title)}
                      className="text-xs text-gray-400 hover:text-blue-300"
                    >
                      {completedContent.includes(item.id || item.title) ? "Completed" : "Mark Complete"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Videos Carousel */}
        {content.filter(item => item.type === 'video').length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent flex items-center">
                <Youtube className="w-6 h-6 mr-2 text-blue-500" />
                Videos
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
              {content.filter(item => item.type === 'video').map((item, index) => (
                <motion.div
                  key={item.id || `video-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="flex-shrink-0 w-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 group snap-start"
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

        {/* Empty State */}
        {content.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-400 text-lg mb-4">
                No content available. Click the refresh button to fetch latest content.
              </p>
              <button
                onClick={fetchContent}
                className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Fetch Content
              </button>
            </motion.div>
          </div>
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
      `}</style>
    </section>
  );
};

export default ContentLibrary;