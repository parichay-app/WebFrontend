import React from 'react'
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Home from './components/home.jsx';
import Profile from './components/Profile.jsx';
import Bookmarks from './components/Bookmarks.jsx';
import PostDetail from './components/PostDetail.jsx';
import './App.css'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/post/:slug" element={<PostDetail />} />
        </Routes>
      </AlertProvider>
    </AuthProvider>
  )
}

export default App
