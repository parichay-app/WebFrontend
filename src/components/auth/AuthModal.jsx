import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginTab) {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        onClose();
      } else {
        setError(result.message);
      }
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      if (result.success) {
        onClose();
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-black border border-gray-800 rounded-2xl p-8 text-white shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-900 transition"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header Logo/Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Parichay</h2>
          <p className="text-gray-500 text-sm mt-1">Join the conversation today</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`flex-1 pb-3 text-center font-bold text-lg border-b-2 transition ${
              isLoginTab ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-white'
            }`}
            onClick={() => { setIsLoginTab(true); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`flex-1 pb-3 text-center font-bold text-lg border-b-2 transition ${
              !isLoginTab ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-white'
            }`}
            onClick={() => { setIsLoginTab(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. johndoe"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {!isLoginTab && (
            <>
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required={!isLoginTab}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full mt-6 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLoginTab ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
