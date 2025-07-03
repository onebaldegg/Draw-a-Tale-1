import apiClient from './authService';

export const questService = {
  // Get all available quests
  async getQuests() {
    try {
      const response = await apiClient.get('/quests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user progress
  async getUserProgress() {
    try {
      const response = await apiClient.get('/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update progress
  async updateProgress(progressData) {
    try {
      const response = await apiClient.post('/progress', progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};