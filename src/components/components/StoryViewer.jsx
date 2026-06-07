import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { DEFAULT_AVATAR } from '/config';

const StoryViewer = ({ isOpen, onClose, stories = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || stories.length === 0) return;
    setCurrentIndex(0);
    setProgress(0);
  }, [isOpen, stories]);

  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    // Reset progress on slide change
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // Increments to reach 100% in 5 seconds (5000ms / 100ms = 50 steps)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, stories]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];
  const mediaUrl = currentStory.media ? (currentStory.media.startsWith('http') ? currentStory.media : `http://localhost:8000${currentStory.media}`) : '';
  const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mkv') || mediaUrl.endsWith('.webm');

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full bg-gray-900/50 hover:bg-gray-800 transition z-20"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Main Content Area */}
      <div className="relative w-full max-w-lg h-[80vh] flex flex-col justify-between p-4 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-900">
        
        {/* Top Progress Bars */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1.5 z-10">
          {stories.map((_, index) => (
            <div key={index} className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: `${
                    index < currentIndex ? 100 : index === currentIndex ? progress : 0
                  }%` 
                }}
              />
            </div>
          ))}
        </div>

        {/* User Badge */}
        <div className="absolute top-8 left-4 flex items-center space-x-2 z-10">
          <img 
            src={currentStory.user.profile_image ? (currentStory.user.profile_image.startsWith('http') ? currentStory.user.profile_image : `http://localhost:8000${currentStory.user.profile_image}`) : DEFAULT_AVATAR} 
            alt={currentStory.user.username} 
            className="w-8 h-8 rounded-full object-cover border border-white/20"
          />
          <div>
            <p className="text-white text-xs font-bold">{currentStory.user.first_name} {currentStory.user.last_name}</p>
            <p className="text-gray-400 text-[10px]">@{currentStory.user.username}</p>
          </div>
        </div>

        {/* Media Rendering */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {isVideo ? (
            <video 
              src={mediaUrl} 
              autoPlay 
              muted 
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Story content" 
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`pointer-events-auto p-2 rounded-full bg-gray-900/50 hover:bg-gray-800 text-white transition disabled:opacity-0`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="pointer-events-auto p-2 rounded-full bg-gray-900/50 hover:bg-gray-800 text-white transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
