import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_AVATAR } from '/config';
import { useAuth } from '../../context/AuthContext';
import { useCustomAlert } from '../../context/AlertContext';
import AuthModal from '../auth/AuthModal';
import {
  ChatBubbleOvalLeftIcon,
  ArrowPathIcon,
  HeartIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  MapPinIcon
} from '@heroicons/react/24/solid';
import MediaViewerModal from './MediaViewerModal';
const PostCard = ({ post, onPostUpdated, onQuoteClick }) => {
  const { user } = useAuth();
  const { showAlert, showConfirm, showChoice } = useCustomAlert();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.description || '');
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const handleMediaClick = (e, index) => {
    e.stopPropagation();
    setSelectedMediaIndex(index);
    setMediaViewerOpen(true);
  };

  const isAuthor = user && user.username === post.user.username;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}post/${post.slug}/like/`);
      if (response.data.status && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async (e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}post/${post.slug}/repost/`);
      if (response.data.status && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}post/${post.slug}/bookmark/`);
      if (response.data.status && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handlePin = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      const response = await axios.post(`${API_BASE_URL}post/${post.slug}/pin/`);
      if (response.data.status && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      const response = await axios.post(`${API_BASE_URL}post/${post.slug}/archive/`);
      if (response.data.status && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error archiving post:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const confirmed = await showConfirm("Are you sure you want to delete this post?", "Delete Post", "Delete", "Cancel");
    if (!confirmed) return;
    try {
      const response = await axios.delete(`${API_BASE_URL}post/${post.slug}/`);
      if (response.data.status && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    try {
      const response = await axios.patch(`${API_BASE_URL}post/${post.slug}/`, {
        title: editTitle,
        description: editText
      });
      if (response.data.status) {
        setIsEditing(false);
        if (onPostUpdated) onPostUpdated();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const copyLink = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const postUrl = `${window.location.origin}/post/${post.slug}`;
    navigator.clipboard.writeText(postUrl);
    showAlert('Post link copied to clipboard!', 'Link Copied');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/post/${post.slug}`);
    }
  };

  // Check if it's a quote post (has parent_post, is NOT a simple repost or reply)
  const isQuotePost = post.parent_post && !post.is_repost && !post.is_reply;

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="border-b border-gray-800 p-4 hover:bg-gray-950/40 transition cursor-pointer relative"
      >
        {/* Pinned Label */}
        {post.is_pinned && (
          <div className="text-xs text-gray-500 font-bold mb-2 flex items-center space-x-1 pl-12">
            <MapPinIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Pinned Post</span>
          </div>
        )}

        {/* Repost Label */}
        {post.is_repost && post.parent_post && (
          <div className="text-xs text-gray-500 font-bold mb-2 flex items-center space-x-1 pl-12">
            <ArrowPathIcon className="w-3.5 h-3.5 text-green-500" />
            <span>@{post.user.username} Reposted</span>
          </div>
        )}

        <div className="flex space-x-3">
          <img
            src={post.user.profile_image ? (post.user.profile_image.startsWith('http') ? post.user.profile_image : `http://localhost:8000${post.user.profile_image}`) : DEFAULT_AVATAR}
            alt={post.user.username}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.user.username}`); }}
          />

          <div className="flex-1 min-w-0">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 truncate">
                <span 
                  onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.user.username}`); }}
                  className="font-bold text-white hover:underline cursor-pointer truncate"
                >
                  {post.is_repost && post.parent_post ? post.parent_post.user.first_name : post.user.first_name} {post.is_repost && post.parent_post ? post.parent_post.user.last_name : post.user.last_name}
                </span>
                <span className="text-gray-500 text-sm truncate">
                  @{post.is_repost && post.parent_post ? post.parent_post.user.username : post.user.username}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm">{formatDateTime(post.created_at)}</span>
              </div>

              {/* Ellipsis Menu Trigger */}
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                  className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-900 transition"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-black border border-gray-800 rounded-xl shadow-2xl z-40 py-1 text-sm">
                    {isAuthor && (
                      <>
                        <button 
                          onClick={handlePin}
                          className="w-full text-left px-4 py-2 hover:bg-gray-900 text-white transition flex items-center space-x-2"
                        >
                          <span>{post.is_pinned ? 'Unpin post' : 'Pin to profile'}</span>
                        </button>
                        <button 
                          onClick={handleArchive}
                          className="w-full text-left px-4 py-2 hover:bg-gray-900 text-white transition flex items-center space-x-2"
                        >
                          <span>{post.is_archived ? 'Unarchive post' : 'Archive post'}</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsEditing(true); setMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-900 text-white transition flex items-center space-x-2"
                        >
                          <span>Edit text</span>
                        </button>
                        <button 
                          onClick={handleDelete}
                          className="w-full text-left px-4 py-2 hover:bg-gray-900 text-red-500 transition flex items-center space-x-2"
                        >
                          <span>Delete post</span>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={copyLink}
                      className="w-full text-left px-4 py-2 hover:bg-gray-900 text-white transition flex items-center space-x-2"
                    >
                      <span>Copy link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Editing mode view */}
            {isEditing ? (
              <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Optional Title"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white outline-none focus:border-blue-500 text-sm"
                />
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white outline-none focus:border-blue-500 text-sm"
                  rows="3"
                />
                <div className="flex space-x-2 justify-end">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-1 text-gray-500 hover:text-white rounded transition"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="p-1 text-green-500 hover:text-green-400 rounded transition"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Content View */
              <div className="mt-1">
                {post.is_repost && post.parent_post ? (
                  <>
                    {post.parent_post.title && <h3 className="font-bold text-white text-md">{post.parent_post.title}</h3>}
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{post.parent_post.description}</p>
                  </>
                ) : (
                  <>
                    {post.title && <h3 className="font-bold text-white text-md">{post.title}</h3>}
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{post.description}</p>
                  </>
                )}
              </div>
            )}

            {/* Visual Quote preview inside the card */}
            {isQuotePost && post.parent_post && (
              <div 
                onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.parent_post.slug}`); }}
                className="mt-3 p-3 border border-gray-800 rounded-2xl hover:bg-gray-900/30 transition flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-1.5">
                  <img 
                    src={post.parent_post.user.profile_image ? (post.parent_post.user.profile_image.startsWith('http') ? post.parent_post.user.profile_image : `http://localhost:8000${post.parent_post.user.profile_image}`) : DEFAULT_AVATAR} 
                    alt={post.parent_post.user.username} 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-bold text-xs text-white">{post.parent_post.user.first_name} {post.parent_post.user.last_name}</span>
                  <span className="text-gray-500 text-[10px]">@{post.parent_post.user.username}</span>
                </div>
                {post.parent_post.title && <p className="font-bold text-xs text-white">{post.parent_post.title}</p>}
                <p className="text-gray-400 text-xs line-clamp-3">{post.parent_post.description}</p>
              </div>
            )}

            {/* Media attachments */}
            {post.post_media && post.post_media.length > 0 && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-800 max-h-96 grid gap-1 grid-cols-1 select-none">
                {post.post_media.map((media, idx) => {
                  const isVideo = media.media_type === 'video' || media.url.endsWith('.mp4');
                  return (
                    <div 
                      key={idx} 
                      onClick={(e) => handleMediaClick(e, idx)}
                      className="relative overflow-hidden cursor-zoom-in group max-h-96"
                    >
                      {isVideo ? (
                        <video 
                          src={`http://localhost:8000${media.url}`} 
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={`http://localhost:8000${media.url}`} 
                          alt="Post attachment" 
                          className="w-full h-full object-cover group-hover:opacity-90 transition"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Social Engagement Actions bar */}
            <div className="flex justify-between max-w-md mt-4 text-gray-500">
              
              {/* Comment/Reply Button */}
              <div className="flex items-center space-x-2 hover:text-blue-400 transition cursor-pointer">
                <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                <span className="text-xs">{post.replies_count}</span>
              </div>

              {/* Repost Options (Repost vs Quote) */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) { setAuthModalOpen(true); return; }
                    showChoice(
                      "How would you like to share this post?",
                      [
                        {
                          label: "Repost",
                          onClick: () => handleRepost(e),
                          className: "bg-blue-500 hover:bg-blue-600 text-white"
                        },
                        {
                          label: "Quote Post",
                          onClick: () => {
                            if (onQuoteClick) onQuoteClick(post);
                          },
                          className: "bg-gray-800 hover:bg-gray-700 text-white"
                        }
                      ],
                      "Repost or Quote"
                    );
                  }}
                  className="flex items-center space-x-2 hover:text-green-400 transition cursor-pointer"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span className="text-xs">{post.reposts_count}</span>
                </button>
              </div>

              {/* Like Button */}
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 hover:text-red-400 transition ${post.is_liked ? 'text-red-500' : ''}`}
              >
                {post.is_liked ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                <span className="text-xs">{post.likes_count}</span>
              </button>

              {/* Impressions/Views count */}
              <div className="flex items-center space-x-2 text-gray-600 cursor-default" title="Unique views">
                <ChartBarIcon className="w-4 h-4" />
                <span className="text-xs">{post.views_count}</span>
              </div>

              {/* Bookmark Button */}
              <button 
                onClick={handleBookmark}
                className={`flex items-center space-x-2 hover:text-blue-400 transition ${post.is_bookmarked ? 'text-blue-500' : ''}`}
              >
                {post.is_bookmarked ? <BookmarkIconSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <MediaViewerModal 
        isOpen={mediaViewerOpen} 
        mediaList={post.post_media} 
        initialIndex={selectedMediaIndex} 
        onClose={() => setMediaViewerOpen(false)} 
      />
    </>
  );
};

export default PostCard;
