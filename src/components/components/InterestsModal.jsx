import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '/config';
import { useAuth } from '../../context/AuthContext';
import { useCustomAlert } from '../../context/AlertContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const InterestsModal = ({ isOpen, onClose, onSaved }) => {
  const { user, updateProfileState } = useAuth();
  const { showAlert } = useCustomAlert();
  const [interestsList, setInterestsList] = useState([
    "Technology", "Sports", "Gaming", "Music", "Entertainment",
    "Art & Design", "Politics", "Science", "Fashion & Beauty", "Business & Finance"
  ]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch dynamic categories list
      axios.get(`${API_BASE_URL}account/interests/`)
        .then(response => {
          if (response.data.status && response.data.data.length > 0) {
            setInterestsList(response.data.data);
          }
        })
        .catch(err => console.error("Error fetching interest categories:", err));

      // Preset current user interests if any
      if (user && user.interests) {
        setSelected(user.interests);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleInterest = (name) => {
    setSelected(prev => 
      prev.includes(name) 
        ? prev.filter(i => i !== name) 
        : [...prev, name]
    );
  };

  const handleSkip = () => {
    sessionStorage.setItem('interests_skipped', 'true');
    onClose();
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one interest or click skip.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}account/interests/`, {
        interests: selected
      });
      if (response.data.status) {
        // Update user state globally in AuthContext
        if (updateProfileState) {
          updateProfileState(response.data.data);
        }
        if (onSaved) onSaved();
        onClose();
      }
    } catch (error) {
      console.error("Error saving user interests:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-black border border-gray-800 rounded-3xl p-8 text-white shadow-2xl">
        
        {/* Optional Skip / Close button */}
        <button 
          onClick={handleSkip} 
          disabled={loading}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-900 transition disabled:opacity-30"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          {/* Logo icon */}
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <span className="font-extrabold text-2xl">P</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Choose your interests</h2>
          <p className="text-gray-500 text-sm mt-1">
            Select what you want to see on Parichay. Your feed will customize automatically.
          </p>
        </div>

        {/* Interests Grid list */}
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 mb-8 scrollbar-thin scrollbar-thumb-gray-800">
          {interestsList.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                disabled={loading}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10 hover:bg-blue-700' 
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900/50 hover:text-white'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 bg-transparent border border-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-full transition disabled:opacity-50 text-sm"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-full transition disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{loading ? 'Personalizing...' : 'Save & Continue'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default InterestsModal;
