// components/CommunityChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Mic, Image, User, MoreVertical, Search } from 'lucide-react';
import { Message } from '../utils/types';

interface CommunityChatProps {
  messages: Message[];
}

const CommunityChat: React.FC<CommunityChatProps> = ({ messages: initialMessages }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setMessages([...messages, {
        user: "You",
        text: newMessage.trim(),
        time: timeString
      }]);
      
      setNewMessage('');
      
      // Simulate response after a delay
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          user: "Community Bot",
          text: "Thanks for your message! The community will respond soon.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 2000);
    }
  };
  
  return (
    <section id="chat" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
        >
          Community Chat
        </motion.h1>
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-green-800/30 max-w-4xl mx-auto"
        >
          {/* Chat header */}
          <div className="bg-gray-900 p-4 border-b border-green-800/30 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-green-400 font-medium">Community Channel</h3>
                <p className="text-xs text-gray-400">
                  {messages.length} messages • 3 online
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="text-gray-400 hover:text-green-400">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-green-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No messages yet. Be the first to say hello!
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start space-x-4 ${msg.user === "You" ? "justify-end" : ""}`}
                    >
                      {msg.user !== "You" && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                          {msg.user[0]}
                        </div>
                      )}
                      <div className={`p-3 rounded-lg max-w-[80%] ${
                        msg.user === "You" 
                          ? "bg-green-600/30 rounded-tr-none text-right" 
                          : "bg-gray-700 rounded-tl-none"
                      }`}>
                        <p className={`font-semibold ${msg.user === "You" ? "text-green-300" : "text-green-400"}`}>
                          {msg.user}
                        </p>
                        <p className="text-gray-200">{msg.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                      </div>
                      {msg.user === "You" && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-white flex-shrink-0">
                          Y
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                          C
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg rounded-tl-none">
                          <div className="flex space-x-1">
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-green-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-green-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                            />
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-green-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Message input */}
            <motion.div 
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="p-4 border-t border-green-800/30 bg-gray-900/50"
            >
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex space-x-2">
                  <button type="button" className="text-gray-400 hover:text-green-400">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="button" className="text-gray-400 hover:text-green-400">
                    <Image className="w-5 h-5" />
                  </button>
                </div>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="w-full p-3 rounded-lg bg-gray-700 border border-green-800/30 text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                />
                <div className="flex space-x-2">
                  <button type="button" className="text-gray-400 hover:text-green-400">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button type="button" className="text-gray-400 hover:text-green-400">
                    <Mic className="w-5 h-5" />
                  </button>
                  <motion.button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg disabled:opacity-50 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityChat;