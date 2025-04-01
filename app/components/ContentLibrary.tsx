// components/ContentLibrary.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { ContentItem } from '../utils/types';

interface ContentLibraryProps {
  videos: ContentItem[];
  tiktoks: ContentItem[];
  books: ContentItem[];
  articles: ContentItem[];
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ videos, tiktoks, books, articles }) => {
  return (
    <section id="content" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Content Library
        </motion.h1>
        
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <motion.div 
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <iframe src={video.url} className="w-full h-64" title={video.title} />
                  <motion.div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                  >
                    <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-white flex items-center">
                      <ExternalLink className="mr-2" /> Watch Original
                    </a>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Add similar sections for tiktoks, books, and articles */}
        </div>
      </div>
    </section>
  );
};

export default ContentLibrary;