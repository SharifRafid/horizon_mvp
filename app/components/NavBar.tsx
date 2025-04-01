// components/Navbar.tsx
import React from 'react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const user = {
    name: "Alex",
    score: 1250,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg z-50"
    >
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-2xl font-bold">Inspire</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
            <span className="mr-2">Score: {user.score}</span>
            <span className="text-sm">🏆</span>
          </div>
          <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;