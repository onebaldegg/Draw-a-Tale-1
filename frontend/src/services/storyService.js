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

  // Generate story with AI (now with real AI integration)
  async generateStory(prompt) {
    try {
      const response = await apiClient.post('/stories/generate', {
        prompt: prompt
      });
      return response.data;
    } catch (error) {
      console.error('AI story generation failed, using fallback:', error);
      
      // Fallback to client-side generation
      const storyData = {
        title: `A Tale of ${prompt}`,
        content: `Once upon a time, there was a wonderful story about ${prompt}...`,
        pages: [
          {
            pageNumber: 1,
            content: `Chapter 1: The Beginning\n\nOnce upon a time, there was a wonderful story about ${prompt}...`,
            drawing_prompt: `Draw the main character of your ${prompt} story`
          },
          {
            pageNumber: 2,
            content: `Chapter 2: The Adventure\n\nOur hero embarked on an amazing journey...`,
            drawing_prompt: `Draw the adventure scene with your character`
          },
          {
            pageNumber: 3,
            content: `Chapter 3: The End\n\nAnd they lived happily ever after!`,
            drawing_prompt: `Draw the happy ending of your story`
          }
        ],
        user_prompt: prompt,
        themes: ['adventure', 'creativity'],
        art_focus: 'character design and storytelling'
      };
      
      const response = await apiClient.post('/stories', storyData);
      return response.data;
    }
  }
};