import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes, useLocation } from "react-router-dom";
import Home from './components/home.jsx';
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}

export default App
