import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '/config';
import { useAuth } from '../context/AuthContext';
import SideBar from './components/sideBar';
import RightSidebar from './components/rightSidebar';
import PostCard from './components/PostCard';
import AuthModal from './auth/AuthModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Bookmarks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}post/bookmarks/`);
      if (response.data.status) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setLoading(false);
      setAuthModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    const handlePostCreated = () => {
      fetchBookmarks();
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex">
        <SideBar />

        {/* Main Feed area */}
        <div className="flex-1 ml-64 border-r border-gray-800 min-h-screen pb-20">
          {/* Header */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-gray-800 p-4 flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="hover:bg-gray-900 p-2 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">Bookmarks</h2>
              <p className="text-gray-500 text-xs">@{user?.username || 'user'}</p>
            </div>
          </div>

          {/* Bookmarked posts listing */}
          <div className="mt-2">
            {posts.map(post => (
              <PostCard 
                key={post.uid} 
                post={post} 
                onPostUpdated={fetchBookmarks}
                onQuoteClick={(p) => navigate('/', { state: { quotePost: p } })}
              />
            ))}

            {!user && (
              <div className="text-center py-20 text-gray-500">
                Please log in to view your bookmarks.
              </div>
            )}

            {user && posts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                You haven't bookmarked any posts yet.
              </div>
            )}
          </div>
        </div>

        <RightSidebar />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Bookmarks;
