// components/CommunityChat.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../utils/types';

interface CommunityChatProps {
  messages: Message[];
}

const CommunityChat: React.FC<CommunityChatProps> = ({ messages }) => {
  return (
    <section id="chat" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Community Chat
        </motion.h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                  {msg.user[0]}
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-semibold">{msg.user}</p>
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-500">{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="mt-4"
          >
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunityChat;