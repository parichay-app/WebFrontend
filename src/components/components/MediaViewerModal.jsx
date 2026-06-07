import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MediaViewerModal = ({ isOpen, mediaList = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Handle keyboard arrow navigation
  useEffect(() => {
    if (!isOpen || mediaList.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaList]);

  if (!isOpen || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex];
  // Determine if file is video based on extension or media_type field
  const isVideo = currentMedia.media_type === 'video' || 
                  currentMedia.url.endsWith('.mp4') || 
                  currentMedia.url.endsWith('.mkv') ||
                  currentMedia.url.endsWith('.webm');

  const handleNext = () => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white"
      onClick={onClose}
    >
      {/* Top bar controls */}
      <div 
        className="absolute top-4 left-4 right-4 flex justify-between items-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm text-gray-400 font-medium">
          {currentIndex + 1} of {mediaList.length}
        </span>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-900/40 hover:bg-gray-800 transition duration-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main viewport area */}
      <div 
        className="flex-1 flex items-center justify-center p-4 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Left */}
        {currentIndex > 0 && (
          <button 
            onClick={handlePrev}
            className="absolute left-6 p-3 rounded-full bg-gray-900/60 hover:bg-gray-800 text-white transition duration-200 z-10 shadow-lg hover:scale-105"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}

        {/* Media Player */}
        <div className="max-h-[85vh] max-w-full flex items-center justify-center rounded-lg overflow-hidden relative shadow-2xl">
          {isVideo ? (
            <video 
              src={`http://localhost:8000${currentMedia.url}`}
              controls
              autoPlay
              className="max-h-[85vh] max-w-full object-contain"
            />
          ) : (
            <img 
              src={`http://localhost:8000${currentMedia.url}`}
              alt="Media view"
              className="max-h-[85vh] max-w-full object-contain"
            />
          )}
        </div>

        {/* Navigation Right */}
        {currentIndex < mediaList.length - 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-6 p-3 rounded-full bg-gray-900/60 hover:bg-gray-800 text-white transition duration-200 z-10 shadow-lg hover:scale-105"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaViewerModal;
