import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api' || 'http://localhost:8001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { access_token } = response.data;
      localStorage.setItem('authToken', access_token);
      
      // Get user data after successful login
      const userResponse = await apiClient.get('/auth/me');
      return userResponse.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }
};

export default apiClient;