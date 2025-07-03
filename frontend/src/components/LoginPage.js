import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import DrawATaleLogo from './DrawATaleLogo';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await authService.login(formData);
      onLogin(userData);
    } catch (error) {
      setError(error.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black relative">
      {/* Logo background layer - behind everything */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="max-w-2xl w-full">
          <img 
            src="/draw-a-tale-logo.svg" 
            alt="Draw-a-Tale Logo" 
            className="w-full h-auto opacity-40"
            style={{ transform: 'scale(1.57)' }}
          />
        </div>
      </div>
      
      {/* Left side - Empty space for logo */}
      <div className="flex-1 bg-black">
      </div>
      
      {/* Right side - Login Form - in front of logo */}
      <div className="flex-1 bg-black flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="rounded-xl shadow-2xl border border-purple-400 p-8" style={{ backgroundColor: '#8A2BE2' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;