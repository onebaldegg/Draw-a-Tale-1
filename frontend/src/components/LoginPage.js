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
    <div className="page-wrapper">
      <div className="container py-16">
        <div className="form-container">
          {/* Logo at top, centered */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <DrawATaleLogo width={280} showTagline={true} />
            </div>
          </div>
          
          {/* Dark form container */}
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden p-8">
            <div className="text-center mb-8">
              <p className="text-gray-300">Welcome back to your creative journey!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-center text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-child btn-primary w-full"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-draw-primary hover:text-indigo-400 font-semibold transition-colors">
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