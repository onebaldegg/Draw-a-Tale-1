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
    <div className="min-h-screen flex bg-black">
      {/* Left side - Logo */}
      <div className="flex-1 bg-black flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <img 
            src="/draw-a-tale-logo.svg" 
            alt="Draw-a-Tale Logo" 
            className="w-full h-auto transform scale-185"
            style={{ transform: 'scale(1.85)' }}
          />
        </div>
      </div>
      
      {/* Right side - Register Form */}
      <div className="flex-1 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                  placeholder="Choose a username"
                  required
                />
              </div>

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
                <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                >
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {formData.user_type === 'child' && (
                <div className="form-group">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">Age (optional)</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                    placeholder="Enter your age"
                    min="5"
                    max="12"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                  placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors underline">
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