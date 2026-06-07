import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_AVATAR } from '/config';
import { useAuth } from '../context/AuthContext';
import SideBar from './components/sideBar';
import RightSidebar from './components/rightSidebar';
import PostCard from './components/PostCard';
import AuthModal from './auth/AuthModal';
import { ArrowLeftIcon, CalendarIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfileState } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'replies', 'media', 'likes', 'archived'
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Social Graph overlays
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [graphModalTitle, setGraphModalTitle] = useState(''); // 'Followers' or 'Following'
  const [graphUsers, setGraphUsers] = useState([]);
  const [graphLoading, setGraphLoading] = useState(false);

  // Edit fields
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    website: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);

  const fetchProfileDetails = async () => {
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}account/user/${username}/`);
      if (profileResponse.data.status) {
        setProfileUser(profileResponse.data.data);
        setEditForm({
          first_name: profileResponse.data.data.first_name || '',
          last_name: profileResponse.data.data.last_name || '',
          bio: profileResponse.data.data.bio || '',
          website: profileResponse.data.data.website || '',
          interests: profileResponse.data.data.interests || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const postsResponse = await axios.get(`${API_BASE_URL}post/user/${username}/?type=${activeTab}`);
      if (postsResponse.data.status) {
        setPosts(postsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileDetails();
  }, [username, currentUser]);

  useEffect(() => {
    fetchUserPosts();
  }, [username, activeTab, currentUser]);

  useEffect(() => {
    const handlePostCreated = () => {
      fetchUserPosts();
      fetchProfileDetails();
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, [username, activeTab]);

  const handleFollowToggle = async (targetUsername = username, isList = false) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}account/user/${targetUsername}/follow/`);
      if (response.data.status) {
        if (isList) {
          // Update user inside follower/following graph overlay list
          setGraphUsers(prev => prev.map(u => u.username === targetUsername ? {
            ...u,
            is_following: response.data.data.is_following
          } : u));
          fetchProfileDetails(); // Refresh parent followers numbers
        } else {
          setProfileUser(prev => ({
            ...prev,
            is_following: response.data.data.is_following,
            followers_count: response.data.data.followers_count,
            following_count: response.data.data.following_count
          }));
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const openGraphModal = async (type) => {
    setGraphModalTitle(type);
    setGraphModalOpen(true);
    setGraphLoading(true);
    try {
      const endpoint = type === 'Followers' ? 'followers' : 'following';
      const response = await axios.get(`${API_BASE_URL}account/user/${username}/${endpoint}/`);
      if (response.data.status) {
        setGraphUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching graph details:', error);
    } finally {
      setGraphLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('first_name', editForm.first_name);
    formData.append('last_name', editForm.last_name);
    formData.append('bio', editForm.bio);
    formData.append('website', editForm.website);
    if (editForm.interests) {
      editForm.interests.forEach(i => formData.append('interests', i));
    }
    if (profileImageFile) formData.append('profile_image', profileImageFile);
    if (bannerImageFile) formData.append('banner_image', bannerImageFile);

    try {
      const response = await axios.patch(`${API_BASE_URL}account/user/${username}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        setProfileUser(response.data.data);
        updateProfileState(response.data.data);
        setEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const toggleInterest = (name) => {
    const current = editForm.interests || [];
    const updated = current.includes(name)
      ? current.filter(i => i !== name)
      : [...current, name];
    setEditForm({ ...editForm, interests: updated });
  };

  const isOwnProfile = currentUser && currentUser.username === username;

  if (loading && !profileUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400">User profile not found.</p>
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

        {/* Main Content Area */}
        <div className="flex-1 ml-64 border-r border-gray-800 min-h-screen pb-20">
          
          {/* Header */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-gray-800 p-4 flex items-center space-x-6">
            <button onClick={() => navigate(-1)} className="hover:bg-gray-900 p-2 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{profileUser.first_name} {profileUser.last_name}</h2>
              <p className="text-gray-500 text-xs">@{profileUser.username}</p>
            </div>
          </div>

          {/* Profile Details Header */}
          <div>
            {/* Banner Image */}
            <div className="h-48 bg-gray-900 relative border-b border-gray-850">
              {profileUser.banner_image && (
                <img 
                  src={`http://localhost:8000${profileUser.banner_image}`} 
                  alt="Profile banner" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Avatar & Action Button */}
            <div className="px-4 pb-4 relative flex justify-between items-end -mt-16">
              <img 
                src={profileUser.profile_image ? (profileUser.profile_image.startsWith('http') ? profileUser.profile_image : `http://localhost:8000${profileUser.profile_image}`) : DEFAULT_AVATAR} 
                alt={profileUser.username} 
                className="w-32 h-32 rounded-full object-cover border-4 border-black bg-black"
              />
              
              <div className="mb-2">
                {isOwnProfile ? (
                  <button 
                    onClick={() => setEditModalOpen(true)}
                    className="border border-gray-700 hover:bg-gray-950 font-bold rounded-full py-2 px-6 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={() => handleFollowToggle(username, false)}
                    className={`font-bold rounded-full py-2 px-6 transition ${
                      profileUser.is_following 
                        ? 'border border-gray-700 text-white hover:bg-red-950/20 hover:text-red-500 hover:border-red-800' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {profileUser.is_following ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info details */}
            <div className="px-4 space-y-3">
              <div>
                <h3 className="text-2xl font-black">{profileUser.first_name} {profileUser.last_name}</h3>
                <p className="text-gray-500">@{profileUser.username}</p>
              </div>

              {profileUser.bio && <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{profileUser.bio}</p>}

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-500 text-sm">
                {profileUser.website && (
                  <div className="flex items-center space-x-1 hover:text-blue-400 cursor-pointer">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <a href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {profileUser.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>Joined Parichay</span>
                </div>
              </div>

              {/* Followers count statistics */}
              <div className="flex space-x-6 text-sm py-2">
                <div onClick={() => openGraphModal('Following')} className="hover:underline cursor-pointer flex space-x-1">
                  <span className="font-bold text-white">{profileUser.following_count}</span>
                  <span className="text-gray-500">Following</span>
                </div>
                <div onClick={() => openGraphModal('Followers')} className="hover:underline cursor-pointer flex space-x-1">
                  <span className="font-bold text-white">{profileUser.followers_count}</span>
                  <span className="text-gray-500">Followers</span>
                </div>
              </div>
            </div>

            {/* Profile Tab Toggles */}
            <div className="flex border-b border-gray-800 mt-6 overflow-x-auto scrollbar-hide">
              <button
                className={`flex-1 py-3.5 min-w-[70px] text-center font-bold text-sm border-b-2 hover:bg-gray-900/40 transition ${
                  activeTab === 'posts' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button
                className={`flex-1 py-3.5 min-w-[70px] text-center font-bold text-sm border-b-2 hover:bg-gray-900/40 transition ${
                  activeTab === 'replies' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('replies')}
              >
                Replies
              </button>
              <button
                className={`flex-1 py-3.5 min-w-[70px] text-center font-bold text-sm border-b-2 hover:bg-gray-900/40 transition ${
                  activeTab === 'media' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('media')}
              >
                Media
              </button>
              <button
                className={`flex-1 py-3.5 min-w-[70px] text-center font-bold text-sm border-b-2 hover:bg-gray-900/40 transition ${
                  activeTab === 'likes' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('likes')}
              >
                Likes
              </button>
              {isOwnProfile && (
                <button
                  className={`flex-1 py-3.5 min-w-[80px] text-center font-bold text-sm border-b-2 hover:bg-gray-900/40 transition ${
                    activeTab === 'archived' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500'
                  }`}
                  onClick={() => setActiveTab('archived')}
                >
                  Archived
                </button>
              )}
            </div>
          </div>

          {/* Posts Feed for Profile */}
          <div className="mt-2">
            {posts.map(post => (
              <PostCard 
                key={post.uid} 
                post={post} 
                onPostUpdated={fetchUserPosts}
                onQuoteClick={(p) => navigate('/', { state: { quotePost: p } })}
              />
            ))}

            {!loading && posts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No posts found under "{activeTab}" tab.
              </div>
            )}
          </div>
        </div>

        <RightSidebar />
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-black border border-gray-800 rounded-2xl p-6 text-white shadow-2xl relative">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">First Name</label>
                  <input 
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Last Name</label>
                  <input 
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows="3"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Website</label>
                <input 
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  placeholder="https://mywebsite.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-2">My Interests</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 border border-gray-800 p-3 rounded-lg bg-gray-950">
                  {[
                    "Technology", "Sports", "Gaming", "Music", "Entertainment",
                    "Art & Design", "Politics", "Science", "Fashion & Beauty", "Business & Finance"
                  ].map((name) => {
                    const isSel = editForm.interests?.includes(name);
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => toggleInterest(name)}
                        className={`text-xs py-1.5 px-3 rounded-full font-bold transition ${
                          isSel 
                            ? 'bg-blue-600 text-white border border-blue-600' 
                            : 'bg-transparent text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Avatar Image</label>
                  <input 
                    type="file"
                    onChange={(e) => setProfileImageFile(e.target.files[0])}
                    className="text-xs text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Banner Image</label>
                  <input 
                    type="file"
                    onChange={(e) => setBannerImageFile(e.target.files[0])}
                    className="text-xs text-gray-400"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-full mt-4 hover:bg-blue-600 transition"
              >
                Save Updates
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Followers / Following Overlays modal */}
      {graphModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 bg-opacity-70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-black border border-gray-800 rounded-2xl p-6 text-white shadow-2xl relative h-[70vh] flex flex-col justify-between">
            <div>
              {/* Modal close button */}
              <button 
                onClick={() => setGraphModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold mb-6 border-b border-gray-800 pb-2">{graphModalTitle}</h3>
              
              {graphLoading ? (
                <div className="text-center py-10 text-gray-500">Loading details...</div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
                  {graphUsers.map(graphUser => {
                    const isSelf = currentUser && currentUser.username === graphUser.username;

                    return (
                      <div key={graphUser.username} className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => { setGraphModalOpen(false); navigate(`/profile/${graphUser.username}`); }}
                        >
                          <img 
                            src={graphUser.profile_image ? (graphUser.profile_image.startsWith('http') ? graphUser.profile_image : `http://localhost:8000${graphUser.profile_image}`) : DEFAULT_AVATAR} 
                            alt={graphUser.username} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-sm hover:underline leading-tight truncate">{graphUser.first_name} {graphUser.last_name}</p>
                            <p className="text-gray-500 text-xs truncate">@{graphUser.username}</p>
                          </div>
                        </div>

                        {!isSelf && (
                          <button 
                            onClick={() => handleFollowToggle(graphUser.username, true)}
                            className={`font-bold rounded-full py-1 px-4 text-xs transition ${
                              graphUser.is_following 
                                ? 'border border-gray-700 text-white hover:bg-red-950/20' 
                                : 'bg-white text-black hover:bg-gray-200'
                            }`}
                          >
                            {graphUser.is_following ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {graphUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No users found.</div>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setGraphModalOpen(false)}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded-full mt-4 hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Profile;
