// pages/Home.tsx
import React from 'react';
import ContentLibrary from './ContentLibrary';
import InteractiveMap from './InteractiveMap';
import FindPassion from './FindPassion';
import ActionHub from './ActionHub';
import CommunityChat from './CommunityChat';

interface HomeProps {
  initialSection?: string;
}

const Home: React.FC<HomeProps> = ({ initialSection = "content" }) => {
  const userLocation = { lat: 40.7128, lng: -74.0060 };
  const nearbyPeople = [
    { 
      id: 1, 
      lat: 40.71, 
      lng: -74.01, 
      name: "Sarah",
      status: "Available",
      interests: ["Environment", "Technology"]
    },
    { 
      id: 2, 
      lat: 40.72, 
      lng: -74.00, 
      name: "Mike",
      status: "Active",
      interests: ["Education", "Community"]
    },
    { 
      id: 3, 
      lat: 40.73, 
      lng: -74.02, 
      name: "Alex",
      status: "Online",
      interests: ["Sustainability", "Innovation"]
    }
  ];
  const passions = [
    { title: "Environmental Activism", desc: "Fight for a greener planet and sustainable future for all generations." },
    { title: "Social Justice", desc: "Advocate for equality, fairness, and human rights for marginalized communities." },
    { title: "Education", desc: "Help provide quality education and learning opportunities for everyone." },
  ];
  // const resources = [
  //   { title: "Green Peace", url: "https://greenpeace.org", preview: "Environmental NGO working to protect our planet's natural resources." },
  //   { title: "Habitat for Humanity", url: "https://habitat.org", preview: "Building homes and communities for those in need around the world." },
  //   { title: "Khan Academy", url: "https://khanacademy.org", preview: "Free education platform with courses on various subjects." },
  // ];
  // const messages = [
  //   { user: "Sarah", text: "Hey everyone! I'm new here and excited to connect.", time: "10:30 AM" },
  //   { user: "Mike", text: "Hello there! Welcome to the community.", time: "10:31 AM" },
  //   { user: "Alex", text: "I'm working on an environmental project if anyone wants to join!", time: "10:35 AM" },
  // ];

  // Render the appropriate component based on initialSection
  const renderSection = () => {
    switch (initialSection) {
      case "content":
        return <ContentLibrary/>;
      case "map":
        return <InteractiveMap userLocation={userLocation} nearbyPeople={nearbyPeople} />;
      case "passion":
        return <FindPassion passions={passions} />;
      case "action":
        return <ActionHub />;
      case "chat":
        return <CommunityChat />;
      default:
        return <ContentLibrary/>;
    }
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 font-sans antialiased">
      {renderSection()}
    </div>
  );
};

export default Home;