import apiClient from './authService';

export const drawingService = {
  // Create new drawing
  async createDrawing(drawingData) {
    try {
      const response = await apiClient.post('/drawings', drawingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all user drawings
  async getUserDrawings() {
    try {
      const response = await apiClient.get('/drawings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific drawing
  async getDrawing(drawingId) {
    try {
      const response = await apiClient.get(`/drawings/${drawingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update drawing
  async updateDrawing(drawingId, drawingData) {
    try {
      const response = await apiClient.put(`/drawings/${drawingId}`, drawingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete drawing
  async deleteDrawing(drawingId) {
    try {
      const response = await apiClient.delete(`/drawings/${drawingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};