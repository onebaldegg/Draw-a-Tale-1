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
    <div className="min-h-screen flex bg-black">
      {/* Left side - Logo with right alignment */}
      <div className="flex-1 bg-black flex items-center justify-end pr-16">
        <div className="max-w-2xl w-full">
          <img 
            src="https://i.imgur.com/3QxT3zD.png" 
            alt="Draw-a-Tale Logo" 
            className="w-full h-auto transform scale-108"
            style={{ transform: 'scale(1.08)' }}
          />
        </div>
      </div>
      
      {/* Right side - Login Form with left alignment */}
      <div className="flex-1 bg-black flex items-center justify-start pl-16">
        <div className="w-full max-w-md">
          <div className="rounded-xl shadow-2xl border border-purple-400 p-8" style={{ backgroundColor: '#8A2BE2' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 bg-purple-100 text-gray-900 placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 bg-purple-100 text-gray-900 placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-lg"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-200 text-center text-sm bg-red-500 bg-opacity-30 p-3 rounded-lg border border-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl bg-white text-purple-700 hover:bg-gray-100 focus:ring-purple-300"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-white">
                Don't have an account?{' '}
                <Link to="/register" className="text-yellow-200 hover:text-yellow-100 font-semibold transition-colors underline">
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