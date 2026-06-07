import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_AVATAR } from '/config';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const ComposeModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handlePhotoClick = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && selectedFiles.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('description', text);
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}post/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        setText('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        // Dispatch global event so active feed pages know to refresh
        window.dispatchEvent(new Event('post-created'));
        onClose();
      }
    } catch (error) {
      console.error('Error creating post from modal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm pt-[10vh]">
      <div className="w-full max-w-lg bg-black border border-gray-800 rounded-2xl p-5 text-white shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={() => { if (!loading) onClose(); }} 
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-900 transition disabled:opacity-30"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-bold mb-4 border-b border-gray-850 pb-2">Compose Post</h3>

        <div className="flex space-x-3">
          <img 
            src={user?.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`) : DEFAULT_AVATAR} 
            alt="Your avatar" 
            className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <textarea 
              placeholder="What's happening?" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent text-lg placeholder-gray-500 resize-none border-none outline-none mt-1 min-h-[100px] disabled:opacity-50"
              autoFocus
            />

            {/* Upload Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-800">
                    <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeSelectedFile(idx)}
                      disabled={loading}
                      className="absolute top-2 right-2 bg-black/75 hover:bg-black p-1 rounded-full text-white transition disabled:opacity-30"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-4 border-t border-gray-850 pt-3">
              <div className="flex space-x-1 text-blue-400">
                <button 
                  onClick={handlePhotoClick}
                  disabled={loading}
                  className="hover:bg-gray-900 p-2 rounded-full transition disabled:opacity-30"
                  title="Add Photo"
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
                onClick={handleSubmit}
                disabled={loading || (!text.trim() && selectedFiles.length === 0)}
                className="bg-blue-500 text-white rounded-full py-2 px-6 font-bold hover:bg-blue-600 transition disabled:opacity-50 text-sm flex items-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Posting' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
