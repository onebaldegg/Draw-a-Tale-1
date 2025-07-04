import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import DrawingCanvas from './components/DrawingCanvas';
import Gallery from './components/Gallery';
import QuestMap from './components/QuestMap';
import ParentPortal from './components/ParentPortal';
import LoadingSpinner from './components/LoadingSpinner';
import RainbowTestPage from './components/RainbowTestPage';

// Import services
import { authService } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App min-h-screen bg-draw-soft">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/dashboard" /> : <RegisterPage onLogin={handleLogin} />
          } 
        />
        
        {/* Test route for rainbow effects - publicly accessible */}
        <Route 
          path="/rainbow-test" 
          element={<RainbowTestPage />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/draw" 
          element={
            user ? <DrawingCanvas user={user} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/gallery" 
          element={
            user ? <Gallery user={user} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/quests" 
          element={
            user ? <QuestMap user={user} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/parent-portal" 
          element={
            user && user.user_type === 'parent' ? <ParentPortal user={user} /> : <Navigate to="/dashboard" />
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;