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
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-gray-200 focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                  placeholder="Choose a username"
                  required
                />
              </div>

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
                <label htmlFor="user_type" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Account Type</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                >
                  <option value="child" className="text-gray-800">Child</option>
                  <option value="parent" className="text-gray-800">Parent</option>
                </select>
              </div>

              {formData.user_type === 'child' && (
                <div className="form-group">
                  <label htmlFor="age" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Age (optional)</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-gray-200 focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                    placeholder="Enter your age"
                    min="5"
                    max="12"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-gray-200 focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2 drop-shadow-lg">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white placeholder-gray-200 focus:border-white focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-lg backdrop-blur-sm"
                  placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-white drop-shadow-lg">
                Already have an account?{' '}
                <Link to="/login" className="text-yellow-200 hover:text-yellow-100 font-semibold transition-colors drop-shadow-lg underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default RegisterPage;