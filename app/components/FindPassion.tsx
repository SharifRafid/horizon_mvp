/* eslint-disable @typescript-eslint/no-explicit-any */
// components/FindPassion.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Briefcase, Plus, Minus, BookMarkedIcon, BookmarkIcon, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Criteria {
  workStyle: string[];
  environment: string[];
  values: string[];
  skills: string[];
  interests: string[];
  personalityTraits: string[];
  impactAreas: string[];
}

interface CareerOption {
  title: string;
  description: string;
  requirements: string[];
  workStyle: string[];
  environment: string[];
  values: string[];
  skills: string[];
  impactAreas: string[];
  matchScore?: number;
}

interface FindPassionProps {
  passions: {
    title: string;
    desc: string;
  }[];
}

// Add new interfaces for Firebase data
interface CareerData extends CareerOption {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
}

interface AddCareerFormData {
  title: string;
  description: string;
  requirements: string;
  workStyle: string[];
  environment: string[];
  values: string[];
  skills: string[];
  impactAreas: string[];
}

const FindPassion: React.FC<FindPassionProps> = ({ }) => {
  const [selectedCriteria, setSelectedCriteria] = useState<Criteria>({
    workStyle: [],
    environment: [],
    values: [],
    skills: [],
    interests: [],
    personalityTraits: [],
    impactAreas: [],
  });

  const [filteredCareers, setFilteredCareers] = useState<CareerData[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['workStyle']); // Start with one section open

  // Add user engagement features
  const [savedCareers, setSavedCareers] = useState<string[]>([]);
  
  // Predefined options for each criteria
  const criteriaOptions = {
    workStyle: ['Remote', 'Hybrid', 'Office-based', 'Field work', 'Flexible hours', 'Project-based'],
    environment: ['Outdoors', 'Office', 'Laboratory', 'Studio', 'Multiple locations', 'Travel required'],
    values: ['Sustainability', 'Innovation', 'Social impact', 'Education', 'Healthcare', 'Environmental protection'],
    skills: ['Communication', 'Analysis', 'Programming', 'Design', 'Research', 'Leadership', 'Problem-solving'],
    interests: ['Technology', 'Nature', 'Art', 'Science', 'Education', 'Social causes', 'Health & wellness'],
    personalityTraits: ['Creative', 'Analytical', 'Social', 'Independent', 'Detail-oriented', 'Leadership'],
    impactAreas: ['Climate', 'Education', 'Healthcare', 'Social justice', 'Technology', 'Arts & culture'],
  };

  // Add new state variables for Firebase integration
  const [careerOptions, setCareerOptions] = useState<CareerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<AddCareerFormData>({
    title: '',
    description: '',
    requirements: '',
    workStyle: [],
    environment: [],
    values: [],
    skills: [],
    impactAreas: [],
  });
  
  // Replace useAuth with direct Firebase auth
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Initialize Firebase auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fetch career data from Firestore
  useEffect(() => {
    const fetchCareers = async () => {
      setIsLoading(true);
      try {
        // Get all approved careers
        const careersQuery = query(collection(db, 'careers'), where('status', '==', 'approved'));
        const careersSnapshot = await getDocs(careersQuery);
        
        const careersData: CareerData[] = [];
        careersSnapshot.forEach((doc) => {
          careersData.push({ id: doc.id, ...doc.data() } as CareerData);
        });
        
        // If user is logged in, also get their pending careers
        if (user) {
          const pendingQuery = query(
            collection(db, 'careers'), 
            where('status', '==', 'pending'),
            where('createdBy', '==', user.uid)
          );
          const pendingSnapshot = await getDocs(pendingQuery);
          
          pendingSnapshot.forEach((doc) => {
            careersData.push({ id: doc.id, ...doc.data() } as CareerData);
          });
        }
        
        setCareerOptions(careersData);
      } catch (error) {
        console.error('Error fetching careers:', error);
        toast.error('Failed to load career data');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch when auth state is determined
    if (!authLoading) {
      fetchCareers();
    }
  }, [user, authLoading]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle multi-select changes
  const handleMultiSelectChange = (category: keyof AddCareerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: Array.isArray(prev[category]) 
        ? prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
        : [value]
    }));
  };
  
  // Submit new career to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add a career');
      return;
    }
    
    try {
      // Convert requirements string to array
      const requirementsArray = formData.requirements
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);
      
      // Add new career to Firestore
      const newCareer = {
        ...formData,
        requirements: requirementsArray,
        status: 'pending',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'careers'), newCareer);
      
      // Add to local state
      setCareerOptions(prev => [
        ...prev, 
        { 
          id: docRef.id, 
          ...newCareer, 
          createdAt: new Date() 
        } as CareerData
      ]);
      
      toast.success('Career added successfully! It will be visible after approval.');
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        workStyle: [],
        environment: [],
        values: [],
        skills: [],
        impactAreas: [],
      });
    } catch (error) {
      console.error('Error adding career:', error);
      toast.error('Failed to add career');
    }
  };

  // Handle criteria selection
  const handleCriteriaChange = (category: keyof Criteria, value: string) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Filter careers based on selected criteria
  useEffect(() => {
    setIsFiltering(true);

    // Check if any criteria are selected
    const hasSelectedCriteria = Object.values(selectedCriteria).some(arr => arr.length > 0);

    if (!hasSelectedCriteria) {
      setFilteredCareers([]);
      setIsFiltering(false);
      return;
    }

    const filtered = careerOptions.map(career => {
      let matchScore = 0;
      let totalCriteria = 0;

      // Calculate match score based on selected criteria
      Object.keys(selectedCriteria).forEach((category) => {
        const selected = selectedCriteria[category as keyof Criteria];
        if (selected.length > 0) {
          totalCriteria += selected.length;
          selected.forEach(criterion => {
            const value = career[category as keyof CareerOption];
            if (Array.isArray(value) && value.includes(criterion)) {
              matchScore += 1;
            }
          });
        }
      });

      return {
        ...career,
        matchScore: totalCriteria > 0 ? (matchScore / totalCriteria) * 100 : 0
      };
    });

    // Filter and sort by match score
    setFilteredCareers(filtered
      .filter(career => career.matchScore! > 30)
      .sort((a, b) => (b.matchScore! - a.matchScore!))
    );
    setIsFiltering(false);
  }, [selectedCriteria, careerOptions]);

  const toggleSaveCareer = (careerTitle: string) => {
    if (savedCareers.includes(careerTitle)) {
      setSavedCareers(savedCareers.filter(title => title !== careerTitle));
    } else {
      setSavedCareers([...savedCareers, careerTitle]);
      toast.success('Career Saved! You can find this in your saved careers list.', {
        duration: 2000,
      });
    }
  };

  return (
    <section id="passion" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          Find Your Passion
        </motion.h1>
        
        <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Discover career paths aligned with your values, skills, and interests. Select criteria below to find your perfect match.
        </p>
        
        {/* Add Career Button (only for logged in users) */}
        {user && !authLoading && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Career
            </button>
          </div>
        )}
        
        {/* Custom Modal for Add Career Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-blue-800/30 text-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-blue-400">Add New Career Path</h3>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                      Career Title
                    </label>
                    <input 
                      id="title" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                      Description
                    </label>
                    <textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      required 
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-300">
                      Requirements (comma separated)
                    </label>
                    <textarea 
                      id="requirements" 
                      name="requirements" 
                      value={formData.requirements} 
                      onChange={handleInputChange} 
                      required 
                      rows={3}
                      placeholder="Bachelor's degree, Programming skills, etc."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Multi-select fields */}
                  {Object.entries(criteriaOptions).map(([category, options]) => (
                    <div key={category} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {options.map((option) => (
                          <label 
                            key={option} 
                            className={`
                              flex items-center p-2 rounded-lg cursor-pointer
                              ${formData[category as keyof AddCareerFormData]?.includes(option)
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'text-gray-300 hover:bg-gray-700/50'}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={formData[category as keyof AddCareerFormData]?.includes(option)}
                              onChange={() => handleMultiSelectChange(category as keyof AddCareerFormData, option)}
                              className="form-checkbox rounded border-blue-500 text-blue-500 focus:ring-blue-500 bg-gray-700 mr-2"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Submit for Approval
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Criteria Selection Panel */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/3"
          >
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-blue-800/30 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 flex items-center">
                <Filter className="w-6 h-6 mr-2" />
                Your Preferences
              </h2>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-2">
                {Object.entries(criteriaOptions).map(([category, options]) => (
                  <div 
                    key={category}
                    className="bg-gray-700/50 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(category)}
                      className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-gray-700/70 transition-colors"
                    >
                      <span className="text-blue-200 font-medium capitalize flex items-center">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                        {selectedCriteria[category as keyof Criteria].length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {selectedCriteria[category as keyof Criteria].length}
                          </span>
                        )}
                      </span>
                      {expandedSections.includes(category) ? (
                        <Minus className="w-4 h-4 text-blue-300" />
                      ) : (
                        <Plus className="w-4 h-4 text-blue-300" />
                      )}
                    </button>

                    {expandedSections.includes(category) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="px-4 pb-3"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {options.map((option) => (
                            <label 
                              key={option} 
                              className={`
                                flex items-center p-2 rounded-lg cursor-pointer
                                ${selectedCriteria[category as keyof Criteria].includes(option)
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'text-gray-300 hover:bg-gray-700/50'}
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCriteria[category as keyof Criteria].includes(option)}
                                onChange={() => handleCriteriaChange(category as keyof Criteria, option)}
                                className="form-checkbox rounded border-blue-500 text-blue-500 focus:ring-blue-500 bg-gray-700 mr-2"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Selected criteria:</span>
                  <span>
                    {Object.values(selectedCriteria).reduce((acc, curr) => acc + curr.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Career Options Panel */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-2/3"
          >
            <h2 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center">
              <Briefcase className="w-6 h-6 mr-2" />
              Matching Careers
              {filteredCareers.length > 0 && (
                <span className="ml-3 text-sm text-gray-400">
                  ({filteredCareers.length} matches)
                </span>
              )}
            </h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading career data...</p>
              </div>
            ) : isFiltering ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : Object.values(selectedCriteria).every(arr => arr.length === 0) ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 p-6 rounded-xl text-center"
              >
                <p className="text-gray-400 text-lg">
                  Select your preferences to see matching careers
                </p>
                <p className="text-gray-500 mt-2">
                  The more criteria you select, the better we can match you with suitable careers
                </p>
              </motion.div>
            ) : filteredCareers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 p-6 rounded-xl text-center"
              >
                <p className="text-gray-400 text-lg">
                  No careers match your current selection
                </p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your criteria to see more options
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white">Your Career Matches</h2>
                  {savedCareers.length > 0 && (
                    <span className="text-blue-400 text-sm">
                      {savedCareers.length} career{savedCareers.length !== 1 ? 's' : ''} saved
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCareers.map((career, index) => (
                    <motion.div
                      key={career.id || index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-gray-800 rounded-xl p-6 border transition-all group relative
                        ${career.status === 'pending' 
                          ? 'border-yellow-600/50 hover:border-yellow-500/70' 
                          : 'border-blue-800/30 hover:border-blue-500/50'}`}
                    >
                      {/* Pending badge */}
                      {career.status === 'pending' && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">
                          Pending Approval
                        </div>
                      )}
                      
                      {/* Save button (only for approved careers) */}
                      {career.status === 'approved' && (
                        <button
                          onClick={() => toggleSaveCareer(career.title)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          {savedCareers.includes(career.title) ? (
                            <BookMarkedIcon className="w-5 h-5 text-blue-400" />
                          ) : (
                            <BookmarkIcon className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      
                      {/* Match Score Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-blue-300 group-hover:text-blue-400 transition-colors pr-4">
                          {career.title}
                        </h3>
                        <div className="flex-shrink-0 bg-gray-900/90 rounded-lg px-3 py-1">
                          <span className="text-lg font-bold text-blue-400">
                            {Math.round(career.matchScore!)}%
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-4 flex-grow">
                        {career.description}
                      </p>

                      {/* Tags Section */}
                      <div className="space-y-3">
                        {/* Requirements */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Requirements
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {career.requirements.map((req, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Key Skills
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {career.skills.map((skill, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Values */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Values
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {career.values.map((value, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-teal-900/30 text-teal-300 rounded-md">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Learn More Button */}
                      <div className="mt-6 flex gap-2">
                        <button className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                          Learn More
                        </button>
                        <button className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                          Related Courses
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FindPassion;