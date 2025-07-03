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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
         style={{
           backgroundImage: 'url(/logo-background.svg)',
           backgroundSize: 'contain',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           backgroundColor: '#f8fafc'
         }}>
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Transparent form container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-gray-200 focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-gray-200 focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-red-200 text-center text-sm bg-red-500 bg-opacity-30 p-3 rounded-lg border border-red-400 border-opacity-40 backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 focus:ring-white"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-white drop-shadow-lg">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow-200 hover:text-yellow-100 font-semibold transition-colors drop-shadow-lg underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;