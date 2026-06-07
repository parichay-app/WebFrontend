import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_AVATAR } from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import StoryViewer from './StoryViewer';
import AuthModal from '../auth/AuthModal';

const StoryTray = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}post/stories/`);
      if (response.data.status) {
        setStories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  // Group stories by username
  const groupedStories = stories.reduce((acc, story) => {
    const username = story.user.username;
    if (!acc[username]) {
      acc[username] = {
        user: story.user,
        items: []
      };
    }
    acc[username].items.push(story);
    return acc;
  }, {});

  const handlePlusClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (uploading) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await axios.post(`${API_BASE_URL}post/stories/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        fetchStories();
      }
    } catch (error) {
      console.error('Error uploading story:', error);
    } finally {
      setUploading(false);
    }
  };

  const openStoryViewer = (userStories) => {
    setSelectedUserStories(userStories);
    setActiveStoryIndex(0);
    setViewerOpen(true);
  };

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-800 overflow-x-auto scrollbar-hide bg-black">
      {/* Active User Story Bubble */}
      <div 
        className={`flex flex-col items-center flex-shrink-0 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`} 
        onClick={() => {
          if (uploading) return;
          if (user && groupedStories[user.username]) {
            openStoryViewer(groupedStories[user.username].items);
          } else {
            handlePlusClick(new Event('click'));
          }
        }}
      >
        <div className="relative">
          <img
            src={user?.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`) : DEFAULT_AVATAR}
            alt="Your story"
            className={`w-14 h-14 rounded-full object-cover border-2 ${
              user && groupedStories[user.username] ? 'border-green-500' : 'border-gray-700'
            }`}
          />
          <div 
            onClick={uploading ? undefined : handlePlusClick}
            className={`absolute bottom-0 right-0 border border-black p-1 rounded-full text-white transition ${
              uploading ? 'bg-gray-850' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {uploading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PlusIcon className="w-3.5 h-3.5" />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,video/*"
            className="hidden" 
          />
        </div>
        <span className="text-xs text-gray-400 mt-1.5 truncate w-16 text-center">Your Story</span>
      </div>

      {/* Other users' stories */}
      {Object.values(groupedStories).map(({ user: storyUser, items }) => {
        // Skip current user (already rendered)
        if (user && storyUser.username === user.username) return null;

        return (
          <div 
            key={storyUser.username}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
            onClick={() => openStoryViewer(items)}
          >
            <div className="p-0.5 rounded-full border-2 border-blue-500">
              <img
                src={storyUser.profile_image ? (storyUser.profile_image.startsWith('http') ? storyUser.profile_image : `http://localhost:8000${storyUser.profile_image}`) : DEFAULT_AVATAR}
                alt={storyUser.username}
                className="w-14 h-14 rounded-full object-cover border border-black"
              />
            </div>
            <span className="text-xs text-gray-300 mt-1.5 truncate w-16 text-center">@{storyUser.username}</span>
          </div>
        );
      })}

      <StoryViewer 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        stories={selectedUserStories} 
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default StoryTray;
