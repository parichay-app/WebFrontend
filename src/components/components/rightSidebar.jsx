import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomAlert } from '../../context/AlertContext';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_AVATAR } from '/config';
import { useNavigate } from 'react-router-dom';

const RightSidebar = () => {
  const { user } = useAuth();
  const { showAlert } = useCustomAlert();
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const fetchRecommendations = () => {
    axios.get(`${API_BASE_URL}account/recommendations/`)
      .then(response => {
        if (response.data.status) {
          setSuggestions(response.data.data.profiles);
        }
      })
      .catch(err => console.error("Error fetching recommended users:", err));
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  // Handle follow toggle
  const handleFollowToggle = async (username) => {
    if (!user) {
      showAlert("Please sign in to follow users.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}account/user/${username}/follow/`);
      if (response.data.status) {
        fetchRecommendations();
        // Dispatch global event so profile or feed pages can update if needed
        window.dispatchEvent(new Event('post-created'));
      }
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  return (
    <div className="w-80 h-screen sticky top-0 p-4 hidden lg:block overflow-y-auto">
      {/* Search */}
      <div className="mb-4 sticky top-0 bg-black pt-2 pb-3 z-10">
        <input 
          type="text" 
          placeholder="Search Parichay" 
          className="w-full bg-gray-900 rounded-full py-3 px-5 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-black transition"
        />
      </div>

      {/* What's happening */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
        <h3 className="text-xl font-bold mb-3">What's happening</h3>
        <div className="space-y-4">
          <div className="hover:bg-gray-800/50 p-2 rounded-lg cursor-pointer transition">
            <p className="text-gray-500 text-xs font-medium">Trending in Tech</p>
            <p className="font-bold text-sm">React 19 & Vite 6</p>
            <p className="text-gray-500 text-xs mt-0.5">42.1K posts</p>
          </div>
          <div className="hover:bg-gray-800/50 p-2 rounded-lg cursor-pointer transition">
            <p className="text-gray-500 text-xs font-medium">Trending in India</p>
            <p className="font-bold text-sm">#DjangoRESTFramework</p>
            <p className="text-gray-500 text-xs mt-0.5">28.5K posts</p>
          </div>
          <div className="hover:bg-gray-800/50 p-2 rounded-lg cursor-pointer transition">
            <p className="text-gray-500 text-xs font-medium">Design · Trending</p>
            <p className="font-bold text-sm">Glassmorphism UI</p>
            <p className="text-gray-500 text-xs mt-0.5">15.2K posts</p>
          </div>
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <h3 className="text-xl font-bold mb-3">Who to follow</h3>
        <div className="space-y-4">
          {suggestions.map((prof) => (
            <div key={prof.uid} className="flex items-center justify-between hover:bg-gray-800/30 p-1.5 rounded-xl transition">
              <div 
                className="flex items-center space-x-3 cursor-pointer min-w-0" 
                onClick={() => navigate(`/profile/${prof.username}`)}
              >
                <img 
                  src={prof.profile_image ? (prof.profile_image.startsWith('http') ? prof.profile_image : `http://localhost:8000${prof.profile_image}`) : DEFAULT_AVATAR} 
                  alt={prof.username} 
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate hover:underline">{prof.first_name} {prof.last_name}</p>
                  <p className="text-gray-500 text-xs truncate">@{prof.username}</p>
                </div>
              </div>
              <button 
                onClick={() => handleFollowToggle(prof.username)}
                className={`rounded-full py-1 px-4 text-xs font-bold transition ml-2 ${
                  prof.is_following 
                    ? 'bg-transparent border border-gray-600 text-white hover:bg-red-650 hover:border-red-600 hover:text-red-500 hover:before:content-["Unfollow"]' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {prof.is_following ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-gray-500 text-center py-2 text-xs">No suggestions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
