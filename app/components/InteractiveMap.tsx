// components/InteractiveMap.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, User } from 'lucide-react';
import { Location, Person } from '../utils/types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom marker icons
const createMarkerIcon = (color: string) => new L.Icon({
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${color}' width='36' height='36'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: 'marker-icon'
});

const userIcon = createMarkerIcon('%23ef4444'); // Red color for user
const otherUserIcon = createMarkerIcon('%2322c55e'); // Green color for others

// Component to handle map center updates
const MapCenterHandler = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

interface InteractiveMapProps {}

const InteractiveMap: React.FC<InteractiveMapProps> = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyPeople, setNearbyPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate random nearby locations
  const generateNearbyPeople = (center: Location) => {
    const testPeople: Person[] = [
      {
        id: 1,
        name: "Sarah Miller",
        status: "Looking to connect",
        interests: ["Environment", "Sustainability", "Community"],
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02,
      },
      {
        id: 2,
        name: "David Chen",
        status: "Active now",
        interests: ["Clean Energy", "Technology", "Education"],
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02,
      },
      {
        id: 3,
        name: "Emma Wilson",
        status: "Available to chat",
        interests: ["Ocean Conservation", "Marine Life", "Volunteering"],
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02,
      },
      {
        id: 4,
        name: "James Thompson",
        status: "Looking for project partners",
        interests: ["Renewable Energy", "Climate Action", "Innovation"],
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02,
      },
      {
        id: 5,
        name: "Maria Garcia",
        status: "Open to collaboration",
        interests: ["Sustainable Agriculture", "Food Security", "Community Gardens"],
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02,
      }
    ];
    
    setNearbyPeople(testPeople);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

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
        generateNearbyPeople(location); // Generate test markers after getting location
        setIsLoading(false);
      },
      (error) => {
        setError('Unable to get your location. Please enable location services.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-green-400">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (error || !userLocation) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900">
        <div className="text-center p-6">
          <p className="text-red-400 mb-4">{error || 'Location not available'}</p>
          <button
            onClick={getUserLocation}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section id="map" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"
        >
          Connect with Others
        </motion.h1>
        
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative h-[600px] rounded-xl overflow-hidden shadow-xl bg-gray-800 border border-green-800/30"
        >
          <MapContainer 
            center={[userLocation.lat, userLocation.lng]} 
            zoom={14} // Slightly closer zoom to see nearby markers better
            className="h-full w-full"
            zoomControl={false}
          >
            <MapCenterHandler center={[userLocation.lat, userLocation.lng]} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Marker */}
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <h3 className="font-semibold text-lg text-red-400">Your Location</h3>
                  <p className="text-sm text-gray-300">You are here</p>
                </div>
              </Popup>
            </Marker>

            {/* Nearby People Markers */}
            {nearbyPeople.map((person) => (
              <Marker
                key={person.id}
                position={[person.lat, person.lng]}
                icon={otherUserIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-3">
                    <h3 className="font-semibold text-lg text-green-400">{person.name}</h3>
                    <p className="text-sm text-gray-300">{person.status}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {person.interests.map((interest, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                    <button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      Connect with {person.name}
                    </button>
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
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Center Map</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveMap;