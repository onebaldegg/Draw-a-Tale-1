import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import DrawATaleLogo from './DrawATaleLogo';

const RegisterPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    user_type: 'child',
    age: ''
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        user_type: formData.user_type,
        age: formData.age ? parseInt(formData.age) : null
      });
      
      // Auto-login after successful registration
      const loginData = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      onLogin(loginData);
    } catch (error) {
      setError(error.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Logo as wallpaper background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <DrawATaleLogo width="80vw" height="80vh" showTagline={true} />
      </div>
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Transparent form container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden p-8">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                  placeholder="Choose a username"
                  required
                />
              </div>

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
                <label htmlFor="user_type" className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                >
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {formData.user_type === 'child' && (
                <div className="form-group">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">Age (optional)</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                    placeholder="Enter your age"
                    min="5"
                    max="12"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg"
                  placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-draw-primary hover:text-indigo-400 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;