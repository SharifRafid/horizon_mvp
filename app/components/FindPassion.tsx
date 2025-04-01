// components/FindPassion.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Passion } from '../utils/types';

interface FindPassionProps {
  passions: Passion[];
}

const FindPassion: React.FC<FindPassionProps> = ({ passions }) => {
  const [interests, setInterests] = useState<string[]>([]);

  return (
    <section id="passion" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Find Your Passion
        </motion.h1>
        
        <div className="flex gap-6">
          <motion.div 
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            className="w-1/2 bg-gray-50 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Your Interests</h2>
            {/* Add interest selection UI here */}
          </motion.div>
          
          <div className="w-1/2">
            {passions.map((passion, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="mb-4 perspective-1000"
              >
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-lg cursor-pointer relative"
                  whileHover={{ rotateY: 180 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="backface-hidden">
                    <h3 className="text-xl font-semibold">{passion.title}</h3>
                  </div>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl backface-hidden"
                    initial={{ rotateY: 180 }}
                  >
                    <p>{passion.desc}</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindPassion;