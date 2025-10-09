import React from 'react';
import { useState,useEffect } from 'react';


const RightSidebar = () => {
  return (
    <div>
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
  )
}

export default RightSidebar
