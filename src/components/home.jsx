import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from "/config";
import axios from 'axios';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  UserIcon,
  PhotoIcon,
  ChartBarIcon,
  FaceSmileIcon,
  CalendarIcon,
  ChatBubbleOvalLeftIcon,
  ArrowPathIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

const Home = () => {
  const [posts,setPosts] = useState([])
  const [likedTweets, setLikedTweets] = useState(new Set())
  const [retweetedTweets, setRetweetedTweets] = useState(new Set())

  const toggleLike = (tweetId) => {
    setLikedTweets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tweetId)) {
        newSet.delete(tweetId)
      } else {
        newSet.add(tweetId)
      }
      return newSet
    })
  }

  const toggleRetweet = (tweetId) => {
    setRetweetedTweets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tweetId)) {
        newSet.delete(tweetId)
      } else {
        newSet.add(tweetId)
      }
      return newSet
    })
  }

  function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    //hour: '2-digit',
    //minute: '2-digit',
    //second: '2-digit',
  });
}

  useEffect (() => {
    axios.get(`${API_BASE_URL}post/`)
      .then(response => {
        console.log(response.data);
        setPosts(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching post:', error);
      });
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-64 fixed h-full p-4 border-r border-gray-800">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">ParichayApp</h1>
          </div>
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
              <HomeIcon className="w-7 h-7" />
              <span className="text-xl font-bold">Home</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
              <MagnifyingGlassIcon className="w-7 h-7" />
              <span className="text-xl">Explore</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
              <BellIcon className="w-7 h-7" />
              <span className="text-xl">Notifications</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
              <EnvelopeIcon className="w-7 h-7" />
              <span className="text-xl">Messages</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
              <UserIcon className="w-7 h-7" />
              <span className="text-xl">Profile</span>
            </div>
          </nav>
          <button className="bg-blue-500 text-white rounded-full py-3 px-8 mt-6 w-full font-bold hover:bg-blue-600">
            Post
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 border-r border-gray-800">
          {/* Header */}
          <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-800 p-4">
            <h2 className="text-xl font-bold">Home</h2>
          </div>

          {/* Tweet Composer */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex space-x-3">
              <img src="https://via.placeholder.com/48" alt="Your avatar" className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <textarea 
                  placeholder="What's happening?" 
                  className="w-full bg-transparent text-xl placeholder-gray-500 resize-none border-none outline-none"
                  rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-4 text-blue-400">
                    <div className="cursor-pointer hover:bg-gray-900 p-2 rounded-full">
                      <PhotoIcon className="w-5 h-5" />
                    </div>
                    <div className="cursor-pointer hover:bg-gray-900 p-2 rounded-full">
                      <ChartBarIcon className="w-5 h-5" />
                    </div>
                    <div className="cursor-pointer hover:bg-gray-900 p-2 rounded-full">
                      <FaceSmileIcon className="w-5 h-5" />
                    </div>
                    <div className="cursor-pointer hover:bg-gray-900 p-2 rounded-full">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <button className="bg-blue-500 text-white rounded-full py-2 px-6 font-bold hover:bg-blue-600">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tweets Feed */}
          <div>
            {posts.map(post => (
              <div key={post.uid} className="border-b border-gray-800 p-4 hover:bg-gray-950 cursor-pointer">
                <div className="flex space-x-3">
                  <img
                  src={API_BASE_URL + post.user.profile_image}
                  alt={post.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{post.user.first_name} {post.user.last_name}</span>
                      <span className="text-gray-500">@{post.user.username}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500">{formatDateTime(post.created_at)}</span>
                    </div>
                    <h3 className='font-bold'>{post.title}</h3>
                    <p className="mt-2 text-white">{post.description}</p>
                    <div className="flex justify-between max-w-md mt-4 text-gray-500">
                      <div className="flex items-center space-x-2 hover:text-blue-400 cursor-pointer">
                        <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                        <span>{post.replies}</span>
                      </div>
                      <div 
                        className={`flex items-center space-x-2 hover:text-green-400 cursor-pointer ${
                          retweetedTweets.has(post.id) ? 'text-green-400' : ''
                        }`}
                        onClick={() => toggleRetweet(post.id)}
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>{post.retweets + (retweetedTweets.has(post.id) ? 1 : 0)}</span>
                      </div>
                      <div 
                        className={`flex items-center space-x-2 hover:text-red-400 cursor-pointer ${
                          likedTweets.has(post.id) ? 'text-red-400' : ''
                        }`}
                        onClick={() => toggleLike(post.id)}
                      >
                        {likedTweets.has(post.id) ? 
                          <HeartIconSolid className="w-5 h-5" /> : 
                          <HeartIcon className="w-5 h-5" />
                        }
                        <span>{post.likes + (likedTweets.has(post.id) ? 1 : 0)}</span>
                      </div>
                      <div className="flex items-center space-x-2 hover:text-blue-400 cursor-pointer">
                        <ShareIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-4">
          {/* Search */}
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Search ParichayApp" 
              className="w-full bg-gray-900 rounded-full py-3 px-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* What's happening */}
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <h3 className="text-xl font-bold mb-3">What's happening</h3>
            <div className="space-y-3">
              <div className="hover:bg-gray-800 p-2 rounded cursor-pointer">
                <p className="text-gray-500 text-sm">Trending in Technology</p>
                <p className="font-bold">React 18</p>
                <p className="text-gray-500 text-sm">42.1K Tweets</p>
              </div>
              <div className="hover:bg-gray-800 p-2 rounded cursor-pointer">
                <p className="text-gray-500 text-sm">Trending</p>
                <p className="font-bold">JavaScript</p>
                <p className="text-gray-500 text-sm">28.5K Tweets</p>
              </div>
              <div className="hover:bg-gray-800 p-2 rounded cursor-pointer">
                <p className="text-gray-500 text-sm">Technology · Trending</p>
                <p className="font-bold">AI Development</p>
                <p className="text-gray-500 text-sm">15.2K Tweets</p>
              </div>
            </div>
          </div>

          {/* Who to follow */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="text-xl font-bold mb-3">Who to follow</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="https://via.placeholder.com/40" alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold">React</p>
                    <p className="text-gray-500 text-sm">@reactjs</p>
                  </div>
                </div>
                <button className="bg-white text-black rounded-full py-1 px-4 font-bold hover:bg-gray-200">
                  Follow
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="https://via.placeholder.com/40" alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold">Vercel</p>
                    <p className="text-gray-500 text-sm">@vercel</p>
                  </div>
                </div>
                <button className="bg-white text-black rounded-full py-1 px-4 font-bold hover:bg-gray-200">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home