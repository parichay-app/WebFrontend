import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_AVATAR } from '/config';
import { useAuth } from '../context/AuthContext';
import SideBar from './components/sideBar';
import RightSidebar from './components/rightSidebar';
import PostCard from './components/PostCard';
import AuthModal from './auth/AuthModal';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Composer
  const [replyText, setReplyText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}post/${slug}/`);
      if (response.data.status) {
        setPost(response.data.data.post);
        setReplies(response.data.data.replies);
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [slug, user]);

  useEffect(() => {
    const handlePostCreated = () => {
      fetchPostDetails();
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, [slug, user]);

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
    setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateReply = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!replyText.trim() && selectedFiles.length === 0) return;
    setReplying(true);

    const formData = new FormData();
    formData.append('description', replyText);
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}post/${slug}/reply/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        setReplyText('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        fetchPostDetails();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading thread...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400">Post not found.</p>
        <button onClick={() => navigate('/')} className="bg-blue-500 text-white rounded-full py-2 px-6 font-bold">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex">
        <SideBar />

        {/* Main Thread Content */}
        <div className="flex-1 ml-64 border-r border-gray-800 min-h-screen pb-20">
          
          {/* Header */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-gray-800 p-4 flex items-center space-x-6">
            <button onClick={() => navigate(-1)} className="hover:bg-gray-900 p-2 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Post</h2>
          </div>

          {/* Root Post Detail Render Card */}
          <PostCard 
            post={post} 
            onPostUpdated={fetchPostDetails} 
            onQuoteClick={(p) => navigate('/', { state: { quotePost: p } })}
          />

          {/* Reply Composer */}
          {user ? (
            <div className="p-4 border-b border-gray-800 bg-gray-950/20">
              <div className="flex space-x-3">
                <img 
                  src={user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`) : DEFAULT_AVATAR} 
                  alt="Your avatar" 
                  className="w-10 h-10 rounded-full object-cover" 
                />
                <div className="flex-1">
                  <textarea 
                    placeholder="Post your reply" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={replying}
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none border-none outline-none mt-2 text-md disabled:opacity-50"
                    rows="2"
                  />

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-800">
                          <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeSelectedFile(idx)}
                            disabled={replying}
                            className="absolute top-2 right-2 bg-black/75 hover:bg-black p-1.5 rounded-full text-white transition disabled:opacity-50"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-3 text-blue-400">
                      <button 
                        onClick={handlePhotoClick} 
                        disabled={replying}
                        className="hover:bg-gray-900 p-2 rounded-full transition disabled:opacity-30"
                      >
                        <PhotoIcon className="w-5 h-5" />
                      </button>
                      <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    <button 
                      onClick={handleCreateReply}
                      disabled={replying || (!replyText.trim() && selectedFiles.length === 0)}
                      className="bg-blue-500 text-white rounded-full py-1.5 px-5 font-bold hover:bg-blue-600 transition disabled:opacity-50 text-sm flex items-center space-x-2"
                    >
                      {replying && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>{replying ? 'Replying' : 'Reply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-gray-800 text-center text-gray-500">
              Please <button onClick={() => setAuthModalOpen(true)} className="text-blue-500 hover:underline">sign in</button> to post a reply.
            </div>
          )}

          {/* Replies Feed Thread */}
          <div>
            {replies.map(reply => (
              <PostCard 
                key={reply.uid} 
                post={reply} 
                onPostUpdated={fetchPostDetails}
                onQuoteClick={(p) => navigate('/', { state: { quotePost: p } })}
              />
            ))}
          </div>
        </div>

        <RightSidebar />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default PostDetail;
