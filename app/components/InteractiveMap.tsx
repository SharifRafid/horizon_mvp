// components/InteractiveMap.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Location, Person } from '../utils/types';

interface InteractiveMapProps {
  userLocation: Location;
  nearbyPeople: Person[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ userLocation, nearbyPeople }) => {
  return (
    <section id="map" className="py-16 bg-gradient-to-br from-purple-100 to-indigo-100">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Connect with Others
        </motion.h1>
        
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative h-[600px] rounded-xl overflow-hidden shadow-xl bg-white"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute"
              style={{ left: '50%', top: '50%' }}
            >
              <MapPin className="text-purple-600 w-8 h-8" />
            </motion.div>
            {nearbyPeople.map((person) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute"
                style={{ 
                  left: `${Math.random() * 80 + 10}%`, 
                  top: `${Math.random() * 80 + 10}%` 
                }}
              >
                <div className="bg-white p-2 rounded-full shadow-md flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  <span>{person.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveMap;