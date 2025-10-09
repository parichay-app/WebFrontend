import React from 'react'
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

const SideBar = () => {
  return (
    <>
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
        </>
  )
}

export default SideBar
