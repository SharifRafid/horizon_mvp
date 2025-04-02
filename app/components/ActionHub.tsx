/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ActionHub.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Plus, 
  X, 
  Check, 
  Clock, 
  AlertCircle,
  Calendar,
  MapPin,
  Tag,
  Globe,
  Heart
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase/config';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  organization: string;
  category: string;
  location: string;
  startDate: string;
  endDate?: string;
  contactEmail: string;
  website: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
}

const ActionHub: React.FC = () => {
  // State for actions and UI
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionItem[]>([]);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    category: 'environment',
    location: '',
    startDate: '',
    endDate: '',
    contactEmail: '',
    website: '',
    imageUrl: ''
  });
  
  // Categories
  const categories = [
    { id: 'environment', name: 'Environment' },
    { id: 'social-justice', name: 'Social Justice' },
    { id: 'education', name: 'Education' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'community', name: 'Community Development' }
  ];
  
  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch actions from Firestore
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const actionsRef = collection(db, 'actions');
        let q;
        
        if (user) {
          // If user is logged in, show approved actions + their pending actions
          q = query(
            actionsRef, 
            where('status', 'in', ['approved', 'pending']),
          );
        } else {
          // If not logged in, only show approved actions
          q = query(actionsRef, where('status', '==', 'approved'));
        }
        
        const querySnapshot = await getDocs(q);
        const actionsList: ActionItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<ActionItem, 'id'>;
          
          // Only include pending actions if they belong to the current user
          if (data.status === 'pending' && data.createdBy !== user?.uid) {
            return;
          }
          
          actionsList.push({
            id: doc.id,
            ...data
          });
        });
        
        setActions(actionsList);
        setFilteredActions(actionsList);
      } catch (error) {
        console.error("Error fetching actions:", error);
      }
    };
    
    fetchActions();
  }, [user]);
  
  // Filter actions based on search and category
  useEffect(() => {
    let filtered = actions;
    
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.category === selectedCategory);
    }
    
    setFilteredActions(filtered);
  }, [searchTerm, selectedCategory, actions]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const newAction = {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'pending'
      };
      
      await addDoc(collection(db, 'actions'), newAction);
      
      // Reset form and close it
      setFormData({
        title: '',
        description: '',
        organization: '',
        category: 'environment',
        location: '',
        startDate: '',
        endDate: '',
        contactEmail: '',
        website: '',
        imageUrl: ''
      });
      
      setShowAddForm(false);
      
      // Refresh actions to include the new one
      const actionsRef = collection(db, 'actions');
      const q = query(
        actionsRef, 
        where('status', 'in', ['approved', 'pending']),
      );
      
      const querySnapshot = await getDocs(q);
      const actionsList: ActionItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<ActionItem, 'id'>;
        
        // Only include pending actions if they belong to the current user
        if (data.status === 'pending' && data.createdBy !== user?.uid) {
          return;
        }
        
        actionsList.push({
          id: doc.id,
          ...data
        });
      });
      
      setActions(actionsList);
      setFilteredActions(actionsList);
      
    } catch (error) {
      console.error("Error adding action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>Pending Approval</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-green-400 text-sm">
            <Check className="w-4 h-4 mr-1" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderActionDetail = () => {
    if (!selectedAction) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-green-800/30"
        >
          {/* Header with image */}
          <div className="relative h-48 bg-gradient-to-r from-green-800 to-green-600 rounded-t-xl overflow-hidden">
            {selectedAction.imageUrl ? (
              <img 
                src={selectedAction.imageUrl} 
                alt={selectedAction.title} 
                className="w-full h-full object-cover opacity-70"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Globe className="w-16 h-16 text-green-300/50" />
              </div>
            )}
            
            <button 
              onClick={() => setSelectedAction(null)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
              <h2 className="text-2xl font-bold text-white">{selectedAction.title}</h2>
              <p className="text-green-300">{selectedAction.organization}</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {selectedAction.status === 'pending' && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800/30 rounded-lg">
                {renderStatusBadge(selectedAction.status)}
                <p className="text-sm text-gray-300 mt-1">
                  This action is awaiting approval and is only visible to you.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-green-400 mb-2">About this Action</h3>
                <p className="text-gray-300 whitespace-pre-line mb-6">{selectedAction.description}</p>
                
                <h3 className="text-xl font-semibold text-green-400 mb-2">Get Involved</h3>
                <a 
                  href={selectedAction.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors mb-4"
                >
                  Visit Website <ExternalLink className="ml-2 w-4 h-4" />
                </a>
                
                <p className="text-gray-300">
                  <span className="font-medium text-white">Contact:</span> {selectedAction.contactEmail}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-300 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Timeline
                  </h4>
                  <p className="text-gray-300">
                    <span className="font-medium text-white">Starts:</span> {selectedAction.startDate}
                  </p>
                  {selectedAction.endDate && (
                    <p className="text-gray-300">
                      <span className="font-medium text-white">Ends:</span> {selectedAction.endDate}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-300 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Location
                  </h4>
                  <p className="text-gray-300">{selectedAction.location}</p>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-300 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-2" /> Category
                  </h4>
                  <p className="text-gray-300">
                    {categories.find(c => c.id === selectedAction.category)?.name || selectedAction.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  const renderAddForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-800/30"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-400">Add New Action</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Campaign or initiative title"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Organization *</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Organization or group name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the initiative, its goals, and how people can participate"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="City, Country or Online"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="contact@example.org"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Website *</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.org"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.org/image.jpg"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-yellow-400 text-sm mb-4 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Your submission will be reviewed before being published.
                </p>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium shadow-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Action'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  return (
    <section id="action" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
          >
            Action Hub
          </motion.h1>
          
          {user && !loading && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Action
            </motion.button>
          )}
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actions..."
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl text-center border border-green-800/30">
            <Globe className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Actions Found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search or filters"
                : "Be the first to add an action to this category!"}
            </p>
            
            {user && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Action
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border ${
                  action.status === 'pending' 
                    ? 'border-yellow-800/30' 
                    : 'border-green-800/30'
                } overflow-hidden cursor-pointer h-full flex flex-col`}
                onClick={() => setSelectedAction(action)}
              >
                <div className="h-40 bg-gradient-to-r from-green-800 to-green-600 relative">
                  {action.imageUrl ? (
                    <img 
                      src={action.imageUrl} 
                      alt={action.title} 
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-green-300/50" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    {action.status === 'pending' && renderStatusBadge(action.status)}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-1 text-green-300">{action.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{action.organization}</p>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3 flex-1">
                    {action.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{action.startDate}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate max-w-[100px]">{action.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {selectedAction && renderActionDetail()}
        {showAddForm && renderAddForm()}
      </AnimatePresence>
    </section>
  );
};

export default ActionHub;