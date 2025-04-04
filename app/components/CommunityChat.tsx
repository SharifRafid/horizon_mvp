/* eslint-disable @typescript-eslint/no-explicit-any */
// components/CommunityChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Paperclip, Image, MoreVertical, Search, AlertCircle} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
} from 'firebase/auth';
import { 
  ref, 
  onValue, 
  push, 
  serverTimestamp as rtdbServerTimestamp,
  set,
  onDisconnect
} from 'firebase/database';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, rtdb } from '../firebase/config';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  isOnline?: boolean;
  lastActive?: any;
}

interface ChatMessage {
  id: string;
  user: {
    uid: string;
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: number;
  channel: string;
}

const CommunityChat: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Channel state
  const [channels] = useState([
    { id: 'general', name: 'General', description: 'General discussion' },
    { id: 'environment', name: 'Environment', description: 'Environmental topics' },
    { id: 'education', name: 'Education', description: 'Educational resources' },
    { id: 'social-justice', name: 'Social Justice', description: 'Social justice initiatives' },
  ]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  
  const router = useRouter();
  
  // Set up auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      
      if (currentUser) {
        try {
          console.log("Fetching user profile from Firestore");
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            console.log("User document exists, setting profile");
            const userData = userDoc.data() as Omit<UserProfile, 'uid'>;
            const profile = {
              uid: currentUser.uid,
              ...userData
            };
            setUserProfile(profile);
            
            // Update online status in Firestore
            await updateDoc(userRef, {
              isOnline: true,
              lastActive: serverTimestamp()
            });
            
            // Update online status in Realtime Database
            const userStatusRef = ref(rtdb, `status/${currentUser.uid}`);
            const userStatusDbRef = ref(rtdb, '.info/connected');
            
            onValue(userStatusDbRef, (snapshot) => {
              if (snapshot.val() === false) return;
              
              onDisconnect(userStatusRef)
                .update({
                  isOnline: false,
                  lastActive: rtdbServerTimestamp()
                })
                .then(() => {
                  set(userStatusRef, {
                    isOnline: true,
                    lastActive: rtdbServerTimestamp(),
                    displayName: profile.name,
                    photoURL: profile.avatar
                  });
                });
            });
          } else {
            console.log("No user profile found");
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        console.log("No user, clearing profile");
        setUserProfile(null);
      }
      
      console.log("Setting loading to false");
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);
  
  // Listen for online users
  useEffect(() => {
    const statusRef = ref(rtdb, 'status');
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const statusData = snapshot.val();
      const onlineUsersList: UserProfile[] = [];
      
      Object.keys(statusData).forEach((uid) => {
        const userData = statusData[uid];
        if (userData.isOnline) {
          onlineUsersList.push({
            uid,
            name: userData.displayName || 'Anonymous',
            email: '',
            avatar: userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
            isOnline: true
          });
        }
      });
      
      setOnlineUsers(onlineUsersList);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Listen for messages in the active channel
  useEffect(() => {
    if (!activeChannel) return;
    
    const messagesRef = ref(rtdb, `messages/${activeChannel}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const messagesData = snapshot.val();
      const messagesList: ChatMessage[] = [];
      
      Object.keys(messagesData).forEach((key) => {
        const message = messagesData[key];
        messagesList.push({
          id: key,
          ...message,
          timestamp: message.timestamp || Date.now()
        });
      });
      
      // Sort messages by timestamp
      messagesList.sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(messagesList);
      
      // Reset unread count for this channel
      if (user) {
        setUnreadCounts(prev => ({
          ...prev,
          [activeChannel]: 0
        }));
      }
    });
    
    return () => unsubscribe();
  }, [activeChannel, user]);
  
  // Listen for new messages in all channels to update unread counts
  useEffect(() => {
    if (!user) return;
    
    const unsubscribes = channels.map(channel => {
      if (channel.id === activeChannel) return () => {};
      
      const messagesRef = ref(rtdb, `messages/${channel.id}`);
      let initialCount = 0;
      let initialized = false;
      
      return onValue(messagesRef, (snapshot) => {
        if (!snapshot.exists()) return;
        
        const messagesData = snapshot.val();
        const count = Object.keys(messagesData).length;
        
        if (!initialized) {
          initialCount = count;
          initialized = true;
          return;
        }
        
        if (count > initialCount) {
          setUnreadCounts(prev => ({
            ...prev,
            [channel.id]: (prev[channel.id] || 0) + (count - initialCount)
          }));
          initialCount = count;
        }
      });
    });
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [channels, activeChannel, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle channel change
  const handleChannelChange = (channelId: string) => {
    setActiveChannel(channelId);
  };
  
  // Handle login
  const handleLogin = () => {
    // Redirect to profile page for login
    if (onClose) onClose();
    // You would need to implement a way to open the profile modal here
    // For now, we'll just redirect to the profile section
    router.push('#profile');
  };
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !userProfile) return;
    
    try {
      const messageData = {
        user: {
          uid: user.uid,
          name: userProfile.name,
          avatar: userProfile.avatar
        },
        text: newMessage,
        timestamp: Date.now(),
        channel: activeChannel
      };
      
      const messagesRef = ref(rtdb, `messages/${activeChannel}`);
      await push(messagesRef, messageData);
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full pt-1"> {/* Added pt-8 to make room for close button */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar - Channels and Online Users */}
        {false ? <div className="w-full md:w-1/3 bg-gray-900 border-r border-blue-500/20 flex flex-col md:h-full overflow-hidden">
          <div className="p-4 border-b border-blue-500/20">
            <h3 className="text-blue-400 font-medium mb-2 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Channels
            </h3>
            <div className="space-y-1">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelChange(channel.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    activeChannel === channel.id 
                      ? 'bg-blue-500/10 text-blue-300' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span># {channel.name}</span>
                  {unreadCounts[channel.id] > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCounts[channel.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-blue-500/20 mt-auto">
            <h3 className="text-blue-400 font-medium mb-2 flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              Online Users ({onlineUsers.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {onlineUsers.length > 0 ? (
                onlineUsers.map(onlineUser => (
                  <div key={onlineUser.uid} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img 
                        src={onlineUser.avatar} 
                        alt={onlineUser.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-gray-300 text-sm truncate">
                      {onlineUser.name}
                      {user && onlineUser.uid === user.uid ? " (You)" : ""}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No users online</div>
              )}
            </div>
          </div>
          
          {!user && !loading && (
            <div className="p-4 bg-gray-800/50 border-t border-blue-500/20">
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Sign In to Chat
              </button>
            </div>
          )}
        </div>:<div></div>}
        
        {/* Mobile channel selector */}
        <div className="md:hidden p-2 bg-gray-900 border-b border-blue-500/20 flex overflow-x-auto">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelChange(channel.id)}
              className={`px-3 py-1 rounded-lg mr-2 flex items-center whitespace-nowrap ${
                activeChannel === channel.id 
                  ? 'bg-blue-500/10 text-blue-300' 
                  : 'text-gray-300 bg-gray-800/50'
              }`}
            >
              <span># {channel.name}</span>
              {unreadCounts[channel.id] > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-2">
                  {unreadCounts[channel.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-gray-900 p-3 border-b border-blue-500/20 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="ml-3">
                <h3 className="text-blue-400 font-medium">
                  #{channels.find(c => c.id === activeChannel)?.name || 'Channel'}
                </h3>
                <p className="text-xs text-gray-400">
                  {channels.find(c => c.id === activeChannel)?.description || 'Channel description'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="text-gray-400 hover:text-blue-400">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-blue-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Message display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>No messages yet in this channel. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start space-x-4 ${user && msg.user.uid === user.uid ? "justify-end" : ""}`}
                  >
                    {(!user || msg.user.uid !== user.uid) && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={msg.user.avatar} 
                          alt={msg.user.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg max-w-[80%] ${
                      user && msg.user.uid === user.uid 
                        ? "bg-blue-600/20 rounded-tr-none text-right" 
                        : "bg-gray-700 rounded-tl-none"
                    }`}>
                      <p className={`font-semibold ${user && msg.user.uid === user.uid ? "text-blue-300" : "text-blue-400"}`}>
                        {msg.user.name}
                        {user && msg.user.uid === user.uid ? " (You)" : ""}
                      </p>
                      <p className="text-gray-200">{msg.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(msg.timestamp)}</p>
                    </div>
                    {user && msg.user.uid === user.uid && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={msg.user.avatar} 
                          alt={msg.user.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Message input */}
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="p-4 border-t border-blue-500/20 bg-gray-900/50"
          >
            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex space-x-2">
                  <button type="button" className="text-gray-400 hover:text-blue-400">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="button" className="text-gray-400 hover:text-blue-400">
                    <Image className="w-5 h-5" />
                  </button>
                </div>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <div className="flex space-x-2">
                  <button type="button" className="text-gray-400 hover:text-blue-400">
                    <Smile className="w-5 h-5" />
                  </button>
                  <motion.button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                  <p className="text-gray-300">Sign in to join the conversation</p>
                </div>
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;