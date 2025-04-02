/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/InteractiveMap.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Location, Person } from '../utils/types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  GeoPoint, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Create custom marker icons
const createMarkerIcon = (color: string) => new L.Icon({
  iconUrl: `https://via.placeholder.com/32/${color}/FFFFFF?text=%E2%80%A2`,
  iconSize: [32, 32],
  popupAnchor: [0, -16],
  className: 'marker-icon',
});

const userIcon = createMarkerIcon('3b82f6'); // Blue for user (matching navbar)
const otherUserIcon = createMarkerIcon('14b8a6'); // Teal for others (matching navbar)

// Component to handle map center updates
const MapCenterHandler = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

interface InteractiveMapProps {
  userLocation: Location;
  nearbyPeople: Person[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyPeople, setNearbyPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [connectionRequests, setConnectionRequests] = useState<number[]>([]);
  const [connections, setConnections] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Default location (San Francisco)
  const defaultLocation = { lat: 37.7749, lng: -122.4194 };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch nearby users from Firestore
  const fetchNearbyUsers = async (center: Location) => {
    setIsLoadingUsers(true);
    try {
      // Create a query to get all users (in a real app, you'd want to limit this by distance)
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const users: Person[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        
        // Skip the current user
        if (currentUser && doc.id === currentUser.uid) return;
        
        // Check if user has location data
        if (userData.location) {
          const userLocation = userData.location;
          
          users.push({
            id: parseInt(doc.id.substring(0, 8), 16), // Convert part of the UID to a number for ID
            name: userData.name || 'Anonymous User',
            status: userData.status || 'Available',
            interests: userData.interests || ['Environment', 'Sustainability'],
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          });
        }
      });
      
      setNearbyPeople(users);
    } catch (error) {
      console.error("Error fetching nearby users:", error);
      toast.error("Failed to load nearby users", {
        duration: 3000,
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getUserLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        
        // Save user location to Firestore if logged in
        if (currentUser) {
          saveUserLocation(location);
        }
        
        // Fetch nearby users
        fetchNearbyUsers(location);
        setIsLoading(false);
      },
      () => {
        setError('Unable to get your location. Please enable location services.');
        setIsLoading(false);
        // Still fetch users based on default location
        fetchNearbyUsers(defaultLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Save user location to Firestore
  const saveUserLocation = async (location: Location) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, {
        location: new GeoPoint(location.lat, location.lng),
        updatedAt: serverTimestamp()
      });
      toast.success("Your location has been saved", {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error saving user location:", error);
    }
  };

  const sendConnectionRequest = (personId: number) => {
    if (!connectionRequests.includes(personId)) {
      setConnectionRequests([...connectionRequests, personId]);
      toast.success("They'll be notified of your interest to connect.", {
        duration: 2000,
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          Connect with Others
        </motion.h1>
        
        <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Discover like-minded individuals in your area who share your passions and interests. Connect, collaborate, and create positive change together.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats and Info Panel - Left Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-blue-500/30 shadow-lg"
            >
              <h2 className="text-xl font-bold text-blue-400 mb-4">Your Network</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-400">{nearbyPeople.length}</p>
                  <p className="text-sm text-gray-400">Nearby</p>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-400">{connections.length}</p>
                  <p className="text-sm text-gray-400">Connected</p>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-400">{connectionRequests.length}</p>
                  <p className="text-sm text-gray-400">Pending</p>
                </div>
              </div>
              
              {!currentUser && (
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <p className="text-blue-400 mb-3">Sign in to save your location and connect with others</p>
                  <button 
                    onClick={() => window.location.href = '#profile'}
                    className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white px-4 py-2 rounded-lg transition-colors text-sm w-full"
                  >
                    Sign In / Create Account
                  </button>
                </div>
              )}
            </motion.div>
            
            {/* Nearby People List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-blue-500/30 shadow-lg"
            >
              <h2 className="text-xl font-bold text-blue-400 mb-4">People Nearby</h2>
              
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-blue-400">Finding people...</span>
                </div>
              ) : nearbyPeople.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {nearbyPeople.map((person) => (
                    <div 
                      key={person.id} 
                      className="bg-gray-700/50 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                        {person.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{person.name}</h3>
                        <p className="text-xs text-gray-400">{person.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {person.interests.slice(0, 2).map((interest, i) => (
                          <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No people found nearby. Try expanding your search area.
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Map - Right Side */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="lg:col-span-2 relative h-[600px] rounded-xl overflow-hidden shadow-xl bg-gray-800 border border-blue-500/30"
          >
            <MapContainer 
              center={userLocation ? [userLocation.lat, userLocation.lng] : [defaultLocation.lat, defaultLocation.lng]} 
              zoom={14}
              className="h-full w-full"
              zoomControl={false}
            >
              <MapCenterHandler center={userLocation ? [userLocation.lat, userLocation.lng] : [defaultLocation.lat, defaultLocation.lng]} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User Marker */}
              {userLocation && (
                <Marker 
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userIcon}
                >
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <h3 className="font-semibold text-lg text-blue-400">Your Location</h3>
                      <p className="text-sm text-gray-300">You are here</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Nearby People Markers */}
              {nearbyPeople.map((person) => (
                <Marker
                  key={person.id}
                  position={[person.lat, person.lng]}
                  icon={otherUserIcon}
                >
                  <Popup className="custom-popup">
                    <div className="p-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-blue-400">{person.name}</h3>
                          <p className="text-sm text-gray-300">{person.status}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {person.interests.map((interest, i) => (
                            <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => sendConnectionRequest(person.id)}
                          disabled={connectionRequests.includes(person.id) || connections.includes(person.id)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                            connectionRequests.includes(person.id) 
                              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                              : connections.includes(person.id)
                                ? 'bg-teal-700 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white'
                          }`}
                        >
                          {connectionRequests.includes(person.id) 
                            ? 'Request Sent' 
                            : connections.includes(person.id)
                              ? 'Connected'
                              : 'Connect'}
                        </button>
                        <button className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                          Message
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-[1000] space-y-2">
              <div className="bg-white/90 p-3 rounded-lg shadow-lg">
                <button 
                  onClick={getUserLocation}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Center Map</span>
                </button>
              </div>
            </div>
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-blue-400 font-medium">Getting your location...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;