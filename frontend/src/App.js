// src/App.js
import './styles.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

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

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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
          element={<ProtectedRoute element={<CreatorDashboard />} allowedRoles={['creator']} />}
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
