// pages/Home.tsx
import React from 'react';
import Navbar from './NavBar';
import ContentLibrary from './ContentLibrary';
import InteractiveMap from './InteractiveMap';
import FindPassion from './FindPassion';
import ActionHub from './ActionHub';
import CommunityChat from './CommunityChat';

const Home: React.FC = () => {
  const videos = [
    { title: "Inspirational Talk", url: "https://youtube.com/embed/dQw4w9WgXcQ", link: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
  ];
  const tiktoks = [
    { title: "Quick Motivation", url: "https://www.tiktok.com/embed/v2/123456", link: "https://tiktok.com/@user/123456" },
  ];
  const books = [
    { title: "The Power of Now", url: "https://example.com/book1.pdf", cover: "https://picsum.photos/200/300" },
  ];
  const articles = [
    { title: "Change the World", url: "https://medium.com/article1", preview: "Lorem ipsum..." },
  ];
  const userLocation = { lat: 40.7128, lng: -74.0060 };
  const nearbyPeople = [
    { id: 1, lat: 40.71, lng: -74.01, name: "Sarah" },
    { id: 2, lat: 40.72, lng: -74.00, name: "Mike" },
  ];
  const passions = [
    { title: "Environmental Activism", desc: "Fight for a greener planet" },
    { title: "Social Justice", desc: "Advocate for equality" },
  ];
  const resources = [
    { title: "Green Peace", url: "https://greenpeace.org", preview: "Environmental NGO" },
  ];
  const messages = [
    { user: "Sarah", text: "Hey everyone!", time: "10:30 AM" },
    { user: "Mike", text: "Hello there!", time: "10:31 AM" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Navbar />
      <ContentLibrary videos={videos} tiktoks={tiktoks} books={books} articles={articles} />
      <InteractiveMap userLocation={userLocation} nearbyPeople={nearbyPeople} />
      <FindPassion passions={passions} />
      <ActionHub resources={resources} />
      <CommunityChat messages={messages} />
    </div>
  );
};

export default Home;