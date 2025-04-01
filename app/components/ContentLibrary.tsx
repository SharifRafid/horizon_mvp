/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ContentLibrary.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, FileText, Youtube, Video, MessageCircle, Book, Newspaper, RefreshCw, InfoIcon } from 'lucide-react';
import { Content } from '../utils/types';
import Masonry from 'react-masonry-css';

interface ContentLibraryProps {
  videos: { title: string; url: string; link: string; }[];
  tiktoks: { title: string; url: string; link: string; }[];
  books: { title: string; url: string; cover: string; }[];
  articles: { title: string; url: string; preview: string; }[];
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<Content[]>([
    // Video content
    {
      title: "Learn Next.js in 100 Seconds",
      description: "Quick introduction to Next.js framework and its key features",
      type: "video",
      url: "https://www.youtube.com/embed/lRQ5z7i7pxE",
      thumbnail: "https://img.youtube.com/vi/lRQ5z7i7pxE/maxresdefault.jpg",
      publishedAt: new Date().toISOString(),
      author: "Fireship"
    },
    {
      title: "TypeScript Course for Beginners",
      description: "Learn TypeScript from scratch with this comprehensive guide",
      type: "video",
      url: "https://www.youtube.com/embed/BwuLxPH8IDs",
      thumbnail: "https://img.youtube.com/vi/BwuLxPH8IDs/maxresdefault.jpg",
      publishedAt: new Date().toISOString(),
      author: "Academind"
    },
    // Article content
    {
      title: "The Complete Guide to Full Stack Development",
      description: "Explore the journey of becoming a full stack developer, from frontend to backend technologies, and everything in between.",
      type: "article",
      url: "https://dev.to/",
      thumbnail: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=500&auto=format&fit=crop&q=60",
      publishedAt: new Date().toISOString(),
      author: "TechLearner"
    },
    {
      title: "Modern JavaScript Best Practices",
      description: "Learn about the latest JavaScript patterns and practices that will make you a better developer.",
      type: "article",
      url: "https://dev.to/",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60",
      publishedAt: new Date().toISOString(),
      author: "JSMaster"
    },
    // Book content
    {
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      description: "Learn how to write code that's easy to understand and maintain. A must-read for every developer.",
      type: "book",
      url: "https://www.goodreads.com/book/show/3735293-clean-code",
      thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60",
      publishedAt: "2008",
      author: "Robert C. Martin"
    },
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      description: "The classic book on software design patterns that every developer should read.",
      type: "book",
      url: "https://www.goodreads.com/book/show/85009.Design_Patterns",
      thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
      publishedAt: "1994",
      author: "Gang of Four"
    },
    {
      title: "The Pragmatic Programmer",
      description: "Your journey to mastery. A collection of practical programming wisdom that will help you become a better programmer.",
      type: "book",
      url: "https://www.goodreads.com/book/show/4099.The_Pragmatic_Programmer",
      thumbnail: "https://images.unsplash.com/photo-1509266272358-7701da638078?w=500&auto=format&fit=crop&q=60",
      publishedAt: "1999",
      author: "Andrew Hunt, David Thomas"
    },
    {
      title: "Building Microservices",
      description: "Designing fine-grained systems. Learn how to design and build microservices architecture.",
      type: "book",
      url: "https://www.goodreads.com/book/show/22512931-building-microservices",
      thumbnail: "https://images.unsplash.com/photo-1456518563096-0ff5ee08204e?w=500&auto=format&fit=crop&q=60",
      publishedAt: "2015",
      author: "Sam Newman"
    }
  ]);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      
      // Combine and shuffle all content types
      const allContent = [
        ...data.videos.map((item: any) => ({ ...item, type: 'video' })),
        ...data.articles.map((item: any) => ({ ...item, type: 'article' })),
        ...data.books.map((item: any) => ({ ...item, type: 'book' }))
      ].sort(() => Math.random() - 0.5);

      setContent(allContent); // Replace test content with new content
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
    <section id="content" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-6">
        {/* Test Content Message */}
        {content.length === 8 && (
          <div className="mb-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg text-blue-300">
            <p className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              You are viewing test content. Click the refresh button to fetch real content from APIs.
            </p>
          </div>
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
              if (activeTab === 'articles') return item.type === 'article';
              if (activeTab === 'books') return item.type === 'book';
              return true;
            })
            .map((item, index) => (
              <motion.div 
                key={`${item.url}-${index}`}
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
                      <h3 className="text-lg font-medium text-green-200 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.description}</p>
                      <span className="text-gray-500 text-xs mt-auto">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown Date'}
                      </span>
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

        {/* Empty State */}
        {content.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              No content available. Click the refresh button to fetch latest content.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentLibrary;