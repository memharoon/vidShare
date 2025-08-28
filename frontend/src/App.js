// src/App.js
import './styles.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import VideoPlayer from './pages/VideoPlayer';
import CreatorDashboard from './pages/CreatorDashboard';
import Stats from './pages/Stats';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

import { setAuthToken } from './api'; // wire axios default auth header

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();

  // Ensure Axios has the JWT on app load and when the token changes
  useEffect(() => {
    setAuthToken(localStorage.getItem('token') || null);

    const onStorage = (e) => {
      if (e.key === 'token') {
        setAuthToken(e.newValue || null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthToken(null);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} allowedRoles={['consumer', 'creator']} />}
        />
        <Route
          path="/upload"
          element={<ProtectedRoute element={<UploadPage />} allowedRoles={['creator']} />}
        />
        <Route
          path="/creator-dashboard"
          element={<ProtectedRoute element={<CreatorDashboard onLogout={handleLogout} />} allowedRoles={['creator']} />}
        />
        <Route
          path="/stats"
          element={<ProtectedRoute element={<Stats />} allowedRoles={['creator']} />}
        />
        <Route
          path="/video/:id"
          element={<ProtectedRoute element={<VideoPlayer />} allowedRoles={['consumer', 'creator']} />}
        />
      </Routes>
    </div>
  );
}

export default AppWrapper;
