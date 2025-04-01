// components/FindPassion.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Briefcase, Heart, Brain, Users, Target, Plus, Minus } from 'lucide-react';
import { Passion } from '../utils/types';

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

const FindPassion: React.FC = () => {
  const [selectedCriteria, setSelectedCriteria] = useState<Criteria>({
    workStyle: [],
    environment: [],
    values: [],
    skills: [],
    interests: [],
    personalityTraits: [],
    impactAreas: [],
  });

  const [filteredCareers, setFilteredCareers] = useState<CareerOption[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['workStyle']); // Start with one section open

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

  // Expanded career options
  const careerOptions: CareerOption[] = [
    {
      title: "Environmental Data Scientist",
      description: "Analyze environmental data to help combat climate change",
      requirements: ["Bachelor's degree", "Programming skills", "Statistics knowledge"],
      workStyle: ["Remote", "Hybrid"],
      environment: ["Laboratory", "Office"],
      values: ["Sustainability", "Environmental protection"],
      skills: ["Analysis", "Programming", "Research"],
      impactAreas: ["Climate", "Technology"],
    },
    {
      title: "Sustainable Architecture Designer",
      description: "Design eco-friendly buildings and sustainable urban spaces",
      requirements: ["Architecture degree", "Design skills", "Environmental knowledge"],
      workStyle: ["Hybrid", "Office-based"],
      environment: ["Studio", "Office"],
      values: ["Sustainability", "Innovation", "Environmental protection"],
      skills: ["Design", "Analysis", "Problem-solving"],
      impactAreas: ["Climate", "Technology", "Arts & culture"],
    },
    {
      title: "Community Health Coordinator",
      description: "Coordinate health programs in local communities",
      requirements: ["Healthcare background", "Communication skills"],
      workStyle: ["Field work", "Flexible hours"],
      environment: ["Multiple locations"],
      values: ["Social impact", "Healthcare"],
      skills: ["Communication", "Leadership"],
      impactAreas: ["Healthcare", "Social justice"],
    },
    {
      title: "Renewable Energy Engineer",
      description: "Design and implement clean energy solutions",
      requirements: ["Engineering degree", "Technical skills"],
      workStyle: ["Hybrid", "Field work"],
      environment: ["Multiple locations", "Laboratory"],
      values: ["Sustainability", "Innovation"],
      skills: ["Analysis", "Problem-solving", "Technical"],
      impactAreas: ["Climate", "Technology"],
    },
    {
      title: "Digital Education Specialist",
      description: "Create and implement online learning programs",
      requirements: ["Education background", "Digital skills"],
      workStyle: ["Remote", "Flexible hours"],
      environment: ["Office"],
      values: ["Education", "Innovation"],
      skills: ["Communication", "Design", "Technology"],
      impactAreas: ["Education", "Technology"],
    },
    {
      title: "Marine Conservation Biologist",
      description: "Study and protect marine ecosystems",
      requirements: ["Biology degree", "Research experience"],
      workStyle: ["Field work", "Flexible hours"],
      environment: ["Outdoors", "Laboratory"],
      values: ["Environmental protection", "Sustainability"],
      skills: ["Research", "Analysis", "Problem-solving"],
      impactAreas: ["Climate", "Education"],
    },
    {
      title: "Social Innovation Consultant",
      description: "Help organizations create positive social impact",
      requirements: ["Business background", "Social sector experience"],
      workStyle: ["Hybrid", "Project-based"],
      environment: ["Multiple locations", "Office"],
      values: ["Social impact", "Innovation"],
      skills: ["Communication", "Leadership", "Analysis"],
      impactAreas: ["Social justice", "Education"],
    },
    {
      title: "Urban Agriculture Specialist",
      description: "Develop sustainable urban farming solutions",
      requirements: ["Agriculture knowledge", "Project management"],
      workStyle: ["Field work", "Flexible hours"],
      environment: ["Outdoors", "Multiple locations"],
      values: ["Sustainability", "Social impact"],
      skills: ["Problem-solving", "Leadership"],
      impactAreas: ["Climate", "Social justice"],
    },
    {
      title: "Mental Health Tech Innovator",
      description: "Develop digital solutions for mental health care",
      requirements: ["Psychology background", "Programming skills"],
      workStyle: ["Remote", "Project-based"],
      environment: ["Office"],
      values: ["Healthcare", "Innovation"],
      skills: ["Programming", "Design", "Research"],
      impactAreas: ["Healthcare", "Technology"],
    },
    {
      title: "Sustainable Fashion Designer",
      description: "Create eco-friendly and ethical fashion",
      requirements: ["Fashion design skills", "Sustainability knowledge"],
      workStyle: ["Studio-based", "Flexible hours"],
      environment: ["Studio"],
      values: ["Sustainability", "Innovation"],
      skills: ["Design", "Creative"],
      impactAreas: ["Climate", "Arts & culture"],
    },
    {
      title: "Clean Energy Policy Analyst",
      description: "Shape policies for renewable energy adoption",
      requirements: ["Policy background", "Energy sector knowledge"],
      workStyle: ["Office-based", "Hybrid"],
      environment: ["Office"],
      values: ["Sustainability", "Social impact"],
      skills: ["Analysis", "Research", "Communication"],
      impactAreas: ["Climate", "Social justice"],
    },
    {
      title: "AI Ethics Researcher",
      description: "Ensure ethical development of artificial intelligence",
      requirements: ["Ethics background", "Tech understanding"],
      workStyle: ["Remote", "Research-based"],
      environment: ["Laboratory", "Office"],
      values: ["Innovation", "Social impact"],
      skills: ["Research", "Analysis", "Programming"],
      impactAreas: ["Technology", "Social justice"],
    },
    {
      title: "Sustainable Tourism Manager",
      description: "Develop eco-friendly tourism programs",
      requirements: ["Tourism background", "Environmental knowledge"],
      workStyle: ["Field work", "Flexible hours"],
      environment: ["Multiple locations", "Outdoors"],
      values: ["Sustainability", "Social impact"],
      skills: ["Leadership", "Communication"],
      impactAreas: ["Climate", "Arts & culture"],
    },
    {
      title: "Circular Economy Consultant",
      description: "Help businesses adopt sustainable practices",
      requirements: ["Business degree", "Sustainability knowledge"],
      workStyle: ["Project-based", "Hybrid"],
      environment: ["Multiple locations"],
      values: ["Sustainability", "Innovation"],
      skills: ["Analysis", "Communication", "Problem-solving"],
      impactAreas: ["Climate", "Technology"],
    },
    {
      title: "Digital Accessibility Specialist",
      description: "Make technology accessible to all users",
      requirements: ["UX knowledge", "Accessibility standards"],
      workStyle: ["Remote", "Project-based"],
      environment: ["Office"],
      values: ["Social impact", "Innovation"],
      skills: ["Design", "Programming", "Communication"],
      impactAreas: ["Technology", "Social justice"],
    },
    {
      title: "Community Garden Coordinator",
      description: "Manage urban farming initiatives",
      requirements: ["Horticulture knowledge", "Community engagement"],
      workStyle: ["Field work", "Flexible hours"],
      environment: ["Outdoors", "Multiple locations"],
      values: ["Sustainability", "Social impact"],
      skills: ["Leadership", "Communication"],
      impactAreas: ["Climate", "Social justice"],
    },
    {
      title: "Sustainable Transportation Planner",
      description: "Design eco-friendly transportation systems",
      requirements: ["Urban planning degree", "Transportation knowledge"],
      workStyle: ["Office-based", "Field work"],
      environment: ["Multiple locations", "Office"],
      values: ["Sustainability", "Innovation"],
      skills: ["Analysis", "Design", "Problem-solving"],
      impactAreas: ["Climate", "Technology"],
    },
    {
      title: "Ocean Plastic Researcher",
      description: "Study and combat ocean plastic pollution",
      requirements: ["Marine science degree", "Research experience"],
      workStyle: ["Field work", "Research-based"],
      environment: ["Laboratory", "Outdoors"],
      values: ["Environmental protection", "Sustainability"],
      skills: ["Research", "Analysis"],
      impactAreas: ["Climate", "Education"],
    },
    {
      title: "Indigenous Rights Advocate",
      description: "Protect and promote indigenous communities' rights",
      requirements: ["Law background", "Cultural knowledge"],
      workStyle: ["Field work", "Flexible hours"],
      environment: ["Multiple locations"],
      values: ["Social impact", "Social justice"],
      skills: ["Communication", "Leadership"],
      impactAreas: ["Social justice", "Education"],
    },
    {
      title: "Sustainable Food Systems Analyst",
      description: "Optimize food supply chains for sustainability",
      requirements: ["Food science degree", "Supply chain knowledge"],
      workStyle: ["Hybrid", "Project-based"],
      environment: ["Multiple locations", "Office"],
      values: ["Sustainability", "Social impact"],
      skills: ["Analysis", "Problem-solving"],
      impactAreas: ["Climate", "Social justice"],
    }
  ];

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
            if (career[category as keyof CareerOption]?.includes(criterion)) {
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
  }, [selectedCriteria]);

  return (
    <section id="passion" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
        >
          Find Your Passions
        </motion.h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Criteria Selection Panel */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-1/3"
          >
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-green-800/30 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4 text-green-300 flex items-center">
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
                      <span className="text-green-200 font-medium capitalize flex items-center">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                        {selectedCriteria[category as keyof Criteria].length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                            {selectedCriteria[category as keyof Criteria].length}
                          </span>
                        )}
                      </span>
                      {expandedSections.includes(category) ? (
                        <Minus className="w-4 h-4 text-green-300" />
                      ) : (
                        <Plus className="w-4 h-4 text-green-300" />
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
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'text-gray-300 hover:bg-gray-700/50'}
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCriteria[category as keyof Criteria].includes(option)}
                                onChange={() => handleCriteriaChange(category as keyof Criteria, option)}
                                className="form-checkbox rounded border-green-500 text-green-500 focus:ring-green-500 bg-gray-700 mr-2"
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
            <h2 className="text-2xl font-semibold mb-6 text-green-300 flex items-center">
              <Briefcase className="w-6 h-6 mr-2" />
              Matching Careers
              {filteredCareers.length > 0 && (
                <span className="ml-3 text-sm text-gray-400">
                  ({filteredCareers.length} matches)
                </span>
              )}
            </h2>

            {isFiltering ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-auto">
                {filteredCareers.map((career, index) => (
                  <motion.div
                    key={career.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    layout
                    className="bg-gray-800 rounded-xl shadow-lg border border-green-800/30 hover:border-green-500/50 transition-all hover:shadow-green-900/20 hover:shadow-xl group h-full"
                  >
                    <div className="p-6 flex flex-col h-full">
                      {/* Match Score Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-green-300 group-hover:text-green-400 transition-colors pr-4">
                          {career.title}
                        </h3>
                        <div className="flex-shrink-0 bg-gray-900/90 rounded-lg px-3 py-1">
                          <span className="text-lg font-bold text-green-400">
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
                              <span key={idx} className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded-md">
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
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Learn More Button */}
                      <button className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                        Learn More
                        <ChevronDown className="w-4 h-4 transform -rotate-90" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FindPassion;