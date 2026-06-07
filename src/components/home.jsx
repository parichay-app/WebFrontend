import React, { useState, useEffect, useRef } from 'react'
import { API_BASE_URL, DEFAULT_AVATAR } from "/config";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideBar from './components/sideBar.jsx';
import RightSidebar from './components/rightSidebar.jsx';
import StoryTray from './components/StoryTray.jsx';
import PostCard from './components/PostCard.jsx';
import AuthModal from './auth/AuthModal';
import InterestsModal from './components/InterestsModal';
import {
  PhotoIcon,
  ChartBarIcon,
  FaceSmileIcon,
  CalendarIcon,
  ChatBubbleOvalLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([])
  const [feedMode, setFeedMode] = useState('for-you') // 'for-you', 'following' or 'grid'
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [interestsModalOpen, setInterestsModalOpen] = useState(false)
  
  // Composer states
  const [postText, setPostText] = useState('')
  const [quotedPost, setQuotedPost] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [isPosting, setIsPosting] = useState(false)
  const fileInputRef = useRef(null)

  const fetchPosts = () => {
    if (feedMode === 'for-you') {
      axios.get(`${API_BASE_URL}account/recommendations/`)
        .then(response => {
          if (response.data.status) {
            setPosts(response.data.data.posts);
          }
        })
        .catch(error => {
          console.error('Error fetching recommended posts:', error);
        });
    } else {
      axios.get(`${API_BASE_URL}post/`)
        .then(response => {
          if (response.data.status) {
            setPosts(response.data.data);
          }
        })
        .catch(error => {
          console.error('Error fetching posts:', error);
        });
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchPosts();
  }, [user, feedMode]);

  useEffect(() => {
    const skipped = sessionStorage.getItem('interests_skipped');
    if (user && (!user.interests || user.interests.length === 0) && skipped !== 'true') {
      setInterestsModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts();
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, [feedMode]);

  useEffect(() => {
    if (location.state && location.state.quotePost) {
      setQuotedPost(location.state.quotePost);
      // Clean up navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handlePhotoClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!postText.trim() && selectedFiles.length === 0 && !quotedPost) return;
    setIsPosting(true);

    const formData = new FormData();
    formData.append('description', postText);
    if (quotedPost) {
      formData.append('quoted_post_slug', quotedPost.slug);
    }
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}post/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        setPostText('');
        setQuotedPost(null);
        setSelectedFiles([]);
        setPreviewUrls([]);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Filter posts that have media for Grid view
  const mediaPosts = posts.filter(post => post.post_media && post.post_media.length > 0 && !post.is_deleted);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex">
        {/* Left Sidebar */}
        <SideBar onPostClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        {/* Main Content */}
        <div className="flex-1 ml-64 border-r border-gray-800 min-h-screen pb-20">
          {/* Header & Mode Toggles */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-gray-800">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Home</h2>
            </div>
            
            {/* View Switching Tabs */}
            <div className="flex text-center border-t border-gray-800">
              <button
                className={`flex-1 py-3 text-sm font-bold border-b-2 hover:bg-gray-900/50 transition ${
                  feedMode === 'for-you' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setFeedMode('for-you')}
              >
                For You
              </button>
              <button
                className={`flex-1 py-3 text-sm font-bold border-b-2 hover:bg-gray-900/50 transition ${
                  feedMode === 'following' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setFeedMode('following')}
              >
                Following
              </button>
              <button
                className={`flex-1 py-3 text-sm font-bold border-b-2 hover:bg-gray-900/50 transition ${
                  feedMode === 'grid' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setFeedMode('grid')}
              >
                Media Grid
              </button>
            </div>
          </div>

          {/* Stories Tray */}
          <StoryTray />

          {/* Post Composer */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex space-x-3">
              <img 
                src={user?.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`) : DEFAULT_AVATAR} 
                alt="Your avatar" 
                className="w-12 h-12 rounded-full object-cover" 
              />
              <div className="flex-1">
                <textarea 
                  placeholder={quotedPost ? "Add a comment to your quote..." : "What's happening?"} 
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  disabled={isPosting}
                  className="w-full bg-transparent text-lg placeholder-gray-500 resize-none border-none outline-none mt-1 disabled:opacity-50"
                  rows="3"
                />

                {/* Quoted Post composer preview */}
                {quotedPost && (
                  <div className="relative mt-2 p-3 border border-gray-800 rounded-2xl bg-gray-950 flex flex-col space-y-1">
                    <button 
                      onClick={() => setQuotedPost(null)}
                      disabled={isPosting}
                      className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 bg-black rounded-full disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <img 
                        src={quotedPost.user.profile_image ? (quotedPost.user.profile_image.startsWith('http') ? quotedPost.user.profile_image : `http://localhost:8000${quotedPost.user.profile_image}`) : DEFAULT_AVATAR} 
                        alt={quotedPost.user.username} 
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-bold text-xs text-white">{quotedPost.user.first_name} {quotedPost.user.last_name}</span>
                      <span className="text-gray-500 text-[10px]">@{quotedPost.user.username}</span>
                    </div>
                    {quotedPost.title && <p className="font-bold text-xs text-white">{quotedPost.title}</p>}
                    <p className="text-gray-400 text-xs line-clamp-2">{quotedPost.description}</p>
                  </div>
                )}

                {/* Media Upload Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-800">
                        <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeSelectedFile(idx)}
                          disabled={isPosting}
                          className="absolute top-2 right-2 bg-black/75 hover:bg-black p-1.5 rounded-full text-white transition disabled:opacity-50"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-3 text-blue-400">
                    <button 
                      onClick={handlePhotoClick}
                      disabled={isPosting}
                      className="cursor-pointer hover:bg-gray-900 p-2 rounded-full transition disabled:opacity-50"
                      title="Add Media"
                    >
                      <PhotoIcon className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      multiple 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*,video/*"
                      className="hidden" 
                    />
                    <button disabled={isPosting} className="cursor-pointer hover:bg-gray-900 p-2 rounded-full transition disabled:opacity-30"><ChartBarIcon className="w-5 h-5" /></button>
                    <button disabled={isPosting} className="cursor-pointer hover:bg-gray-900 p-2 rounded-full transition disabled:opacity-30"><FaceSmileIcon className="w-5 h-5" /></button>
                    <button disabled={isPosting} className="cursor-pointer hover:bg-gray-900 p-2 rounded-full transition disabled:opacity-30"><CalendarIcon className="w-5 h-5" /></button>
                  </div>
                  <button 
                    onClick={handleCreatePost}
                    disabled={isPosting || (!postText.trim() && selectedFiles.length === 0 && !quotedPost)}
                    className="bg-blue-500 text-white rounded-full py-2 px-6 font-bold hover:bg-blue-600 transition disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isPosting && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Content */}
          {feedMode !== 'grid' ? (
            <div>
              {posts.map(post => (
                <PostCard 
                  key={post.uid} 
                  post={post} 
                  onPostUpdated={fetchPosts} 
                  onQuoteClick={(p) => {
                    setQuotedPost(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  No posts found in feed.
                </div>
              )}
            </div>
          ) : (
            /* Instagram-style Visual media Grid */
            <div className="grid grid-cols-3 gap-1.5 p-2">
              {mediaPosts.map(post => (
                <div 
                  key={post.uid}
                  onClick={() => navigate(`/post/${post.slug}`)}
                  className="aspect-square relative cursor-pointer group border border-gray-900 overflow-hidden bg-gray-900"
                >
                  <img 
                    src={`http://localhost:8000${post.post_media[0].url}`} 
                    alt={post.description} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-4">
                    <div className="flex items-center text-white space-x-1.5">
                      <HeartIconSolid className="w-5 h-5" />
                      <span className="font-bold text-sm">{post.likes_count}</span>
                    </div>
                    <div className="flex items-center text-white space-x-1.5">
                      <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                      <span className="font-bold text-sm">{post.replies_count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {mediaPosts.length === 0 && (
                <div className="col-span-3 text-center py-20 text-gray-500">
                  No visual media posts found in feed.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <InterestsModal isOpen={interestsModalOpen} onClose={() => setInterestsModalOpen(false)} onSaved={fetchPosts} />
    </div>
  )
}

export default Home