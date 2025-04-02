/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ContentLibrary.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, FileText, Youtube, Video, MessageCircle, Book, Newspaper, RefreshCw, InfoIcon, CheckIcon } from 'lucide-react';
import { Content } from '../utils/types';
import Masonry from 'react-masonry-css';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ContentLibraryProps {
  videos?: { title: string; url: string; link: string; }[];
  tiktoks?: { title: string; url: string; link: string; }[];
  books?: { title: string; url: string; cover: string; }[];
  articles?: { title: string; url: string; preview: string; }[];
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Add a personalized welcome message
  // const [userName, setUserName] = useState("Alex"); // Get from user profile
  const userName = "Alex"; // Get from user profile
  
  // Add content progress tracking
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  
  const markAsCompleted = (contentId: string) => {
    if (!completedContent.includes(contentId)) {
      setCompletedContent([...completedContent, contentId]);
      // Could save to user profile/backend here
    }
  };

  // Load content from Firestore on component mount
  useEffect(() => {
    loadContentFromFirestore();
  }, []);

  const loadContentFromFirestore = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const contentCollection = collection(db, 'content');
      const contentQuery = query(contentCollection, orderBy('createdAt', 'desc'));
      const contentSnapshot = await getDocs(contentQuery);
      
      if (contentSnapshot.empty) {
        console.log('No content in Firestore, fetching from API');
        await fetchContent();
        return;
      }
      
      const contentData = contentSnapshot.docs.map(doc => ({
        ...doc.data() as Content
      }));
      
      setContent(contentData);
      console.log('Content loaded from Firestore:', contentData.length, 'items');
    } catch (err) {
      console.error('Error loading content from Firestore:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
    switch(type) {
      case 'video':
        return <Youtube className="w-5 h-5" />;
      case 'tiktok':
        return <Video className="w-5 h-5" />;
      case 'book':
        return <BookOpen className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  // Get content type color
  const getContentColor = (type: string) => {
    switch(type) {
      case 'video':
        return 'from-red-500 to-red-400';
      case 'tiktok':
        return 'from-blue-500 to-purple-400';
      case 'book':
        return 'from-amber-500 to-yellow-400';
      case 'article':
        return 'from-green-500 to-green-400';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
        >
          Content Library
        </motion.h1>
        
        {/* Personalized welcome */}
        <p className="text-gray-300 text-center mb-8">
          Welcome back, {userName}! {completedContent.length > 0 ? `You've explored ${completedContent.length} resources so far.` : "Start exploring resources tailored for your journey."}
        </p>
        
        {/* Progress bar if user has viewed content */}
        {completedContent.length > 0 && (
          <div className="mb-8 mx-auto max-w-md">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round((completedContent.length / content.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedContent.length / content.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-green-400"
              />
            </div>
          </div>
        )}
        
        {/* Test Content Message - improved visibility */}
        {content.length === 8 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-blue-300 max-w-2xl mx-auto"
          >
            <p className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5 flex-shrink-0" />
              <span>You&apos;re viewing sample content. <button onClick={fetchContent} className="text-blue-200 underline hover:text-blue-100">Click here</button> to fetch real content from our APIs.</span>
            </p>
          </motion.div>
        )}

        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
          >
            Content Library
          </motion.h1>
          
          <button
            onClick={fetchContent}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'}
              text-white transition-colors
            `}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Fetching Content...' : 'Refresh Content'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
            { id: 'tiktoks', label: 'Short Videos', icon: <Video className="w-4 h-4" /> },
            { id: 'articles', label: 'Articles', icon: <Newspaper className="w-4 h-4" /> },
            { id: 'books', label: 'Books', icon: <Book className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <h3 className="text-2xl font-semibold text-white mb-4">Available Content</h3>
        <p className="text-gray-400 mb-8">Browse through our extensive library of resources tailored for your learning journey.</p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-3 text-green-400">Loading content...</p>
          </div>
        )}

        {/* Custom CSS for Masonry layout */}
        <style jsx global>{`
          .my-masonry-grid {
            display: flex;
            margin-left: -24px; /* gutter size offset */
            width: auto;
          }
          .my-masonry-grid_column {
            padding-left: 24px; /* gutter size */
            background-clip: padding-box;
          }
        `}</style>
        
        {!isLoading && (
          <Masonry
            breakpointCols={{
              default: 4,
              1536: 4,
              1280: 3,
              1024: 2,
              768: 2,
              640: 1
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {content
              .filter(item => {
                if (activeTab === 'all') return true;
                if (activeTab === 'videos') return item.type === 'video';
                if (activeTab === 'tiktoks') return item.type === 'tiktok';
                if (activeTab === 'articles') return item.type === 'article';
                if (activeTab === 'books') return item.type === 'book';
                return true;
              })
              .map((item, index) => (
                <motion.div 
                  key={(item as any).id || `${item.url}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 relative group bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-green-800/30"
                >
                  {/* Content Type Badge */}
                  <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-gradient-to-r ${getContentColor(item.type)} text-white text-xs font-medium flex items-center gap-1 shadow-lg`}>
                    {getContentIcon(item.type)}
                    <span className="capitalize">{item.type}</span>
                  </div>
                  
                  {/* Video Content */}
                  {item.type === 'video' && (
                    <div className="flex flex-col h-full">
                      <div className="relative w-full pt-[56.25%]">
                        <img 
                          src={item.thumbnail}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
                          >
                            <Youtube className="w-5 h-5" />
                            Watch Video
                          </a>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-green-200 mb-2 line-clamp-2">{item.title}</h3>
                          {completedContent.includes(item.title) && (
                            <div className="bg-green-500/20 p-1 rounded-full">
                              <CheckIcon className="w-4 h-4 text-green-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.description}</p>
                        <span className="text-gray-500 text-xs mt-auto">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown Date'}
                        </span>
                        <button 
                          onClick={() => markAsCompleted(item.title)}
                          className="mt-2 text-xs text-green-400 hover:text-green-300 self-end"
                        >
                          {completedContent.includes(item.title) ? "Completed ✓" : "Mark as completed"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TikTok/Short Video Content */}
                  {item.type === 'tiktok' && (
                    <div className="flex flex-col h-full">
                      <div className="relative w-full pt-[177.78%]"> {/* 16:9 aspect ratio */}
                        <img 
                          src={item.thumbnail}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                          >
                            <Video className="w-5 h-5" />
                            Watch Short
                          </a>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-blue-200 mb-2 line-clamp-2">{item.title}</h3>
                          {completedContent.includes(item.id || item.title) && (
                            <div className="bg-blue-500/20 p-1 rounded-full">
                              <CheckIcon className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.description}</p>
                        <span className="text-gray-500 text-xs mt-auto">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown Date'}
                        </span>
                        <button 
                          onClick={() => markAsCompleted(item.id || item.title)}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300 self-end"
                        >
                          {completedContent.includes(item.id || item.title) ? "Completed ✓" : "Mark as completed"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Article Content */}
                  {item.type === 'article' && (
                    <div className="flex flex-col h-full">
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-green-200 mb-3 line-clamp-2 mt-8">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
                          <span className="text-gray-500 text-xs">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown Date'}
                          </span>
                          <a 
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 flex items-center gap-2 text-sm hover:text-green-300 transition-colors"
                          >
                            Read More
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Book Content */}
                  {item.type === 'book' && (
                    <div className="flex flex-col h-full">
                      <div className="relative pt-[140%]">
                        <img 
                          src={item.thumbnail}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <a 
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 text-white w-full py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                            >
                              <BookOpen className="w-5 h-5" />
                              View Book
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-green-200 mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{item.author}</p>
                        <span className="text-gray-500 text-xs">
                          Published: {item.publishedAt}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
          </Masonry>
        )}

        {/* Empty State */}
        {content.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              No content available. Click the refresh button to fetch latest content.
            </p>
            <button
              onClick={fetchContent}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Fetch Content
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentLibrary;