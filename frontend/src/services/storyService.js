import apiClient from './authService';

export const storyService = {
  // Create new story
  async createStory(storyData) {
    try {
      const response = await apiClient.post('/stories', storyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all user stories
  async getUserStories() {
    try {
      const response = await apiClient.get('/stories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate story with AI (placeholder for now)
  async generateStory(prompt) {
    try {
      // TODO: Implement AI story generation
      const storyData = {
        title: `A Tale of ${prompt}`,
        content: `Once upon a time, there was a wonderful story about ${prompt}...`,
        pages: [
          {
            pageNumber: 1,
            content: `Chapter 1: The Beginning\n\nOnce upon a time, there was a wonderful story about ${prompt}...`,
            drawingPrompt: `Draw the main character of your ${prompt} story`
          },
          {
            pageNumber: 2,
            content: `Chapter 2: The Adventure\n\nOur hero embarked on an amazing journey...`,
            drawingPrompt: `Draw the adventure scene with your character`
          },
          {
            pageNumber: 3,
            content: `Chapter 3: The End\n\nAnd they lived happily ever after!`,
            drawingPrompt: `Draw the happy ending of your story`
          }
        ],
        user_prompt: prompt
      };
      
      const response = await apiClient.post('/stories', storyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};