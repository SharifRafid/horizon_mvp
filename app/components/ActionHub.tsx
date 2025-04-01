// components/ActionHub.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { ContentItem } from '../utils/types';

interface ActionHubProps {
  resources: ContentItem[];
}

const ActionHub: React.FC<ActionHubProps> = ({ resources }) => {
  return (
    <section id="action" className="py-16 bg-gradient-to-br from-purple-100 to-indigo-100">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Action Hub
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.preview}</p>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-600 hover:text-purple-800"
              >
                Visit <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActionHub;