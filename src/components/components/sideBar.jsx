import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'
import ComposeModal from './ComposeModal'
import { DEFAULT_AVATAR } from '/config'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  UserIcon,
  BookmarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const SideBar = ({ onPostClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.username}`);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleBookmarksClick = () => {
    if (user) {
      navigate('/bookmarks');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handlePostClick = () => {
    if (user) {
      setComposeModalOpen(true);
      if (onPostClick) onPostClick();
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <div className="w-64 fixed h-full p-4 border-r border-gray-800 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center mb-6 pl-3">
            <span className="text-2xl font-black tracking-wider text-blue-500 hover:text-blue-400 transition cursor-pointer">
              PARICHAY
            </span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link to="/" className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition cursor-pointer">
              <HomeIcon className="w-7 h-7" />
              <span className="text-xl font-bold">Home</span>
            </Link>
            
            <div className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition cursor-pointer">
              <MagnifyingGlassIcon className="w-7 h-7" />
              <span className="text-xl">Explore</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition cursor-pointer">
              <BellIcon className="w-7 h-7" />
              <span className="text-xl">Notifications</span>
            </div>
            
            <div 
              onClick={handleBookmarksClick}
              className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition cursor-pointer"
            >
              <BookmarkIcon className="w-7 h-7" />
              <span className="text-xl">Bookmarks</span>
            </div>
            
            <div 
              onClick={handleProfileClick}
              className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition cursor-pointer"
            >
              <UserIcon className="w-7 h-7" />
              <span className="text-xl">Profile</span>
            </div>
          </nav>
          
          <button 
            onClick={handlePostClick}
            className="bg-blue-500 text-white rounded-full py-3 px-8 mt-6 w-full font-bold hover:bg-blue-600 transition shadow-md hover:shadow-blue-500/20"
          >
            Post
          </button>
        </div>

        {/* User Card at the Bottom */}
        <div className="mb-4">
          {user ? (
            <div className="flex items-center justify-between p-3 rounded-full hover:bg-gray-900 transition">
              <Link to={`/profile/${user.username}`} className="flex items-center space-x-3 flex-1 min-w-0">
                <img 
                  src={user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`) : DEFAULT_AVATAR} 
                  alt={user.username} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate leading-tight">{user.first_name} {user.last_name}</p>
                  <p className="text-gray-500 text-xs truncate">@{user.username}</p>
                </div>
              </Link>
              <button 
                onClick={logout} 
                className="text-gray-500 hover:text-red-400 p-2 rounded-full transition"
                title="Log out"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="w-full border border-gray-700 hover:bg-gray-900 text-white rounded-full py-3 font-bold transition"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ComposeModal isOpen={composeModalOpen} onClose={() => setComposeModalOpen(false)} />
    </>
  )
}

export default SideBar
