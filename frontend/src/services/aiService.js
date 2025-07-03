import * as tf from '@tensorflow/tfjs';
import apiClient from './authService';

class AIAssistanceService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.progressThreshold = 30000; // 30 seconds without progress
    this.lastActivityTime = Date.now();
    this.isAnalyzing = false;
  }

  async initialize() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');
      
      // For now, we'll use a simple rule-based system
      // In production, you could load a pre-trained model for drawing analysis
      this.isModelLoaded = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AI assistance:', error);
      return false;
    }
  }

  // Monitor drawing progress and detect when user might need help
  monitorDrawingProgress(timeLapse, currentTool, isDrawing) {
    this.lastActivityTime = Date.now();
    
    if (isDrawing) {
      this.analyzeDrawingPattern(timeLapse, currentTool);
    }
  }

  // Analyze drawing patterns to provide suggestions
  analyzeDrawingPattern(timeLapse, currentTool) {
    if (this.isAnalyzing || !timeLapse || timeLapse.length === 0) return;
    
    this.isAnalyzing = true;
    
    setTimeout(() => {
      const analysis = this.performPatternAnalysis(timeLapse, currentTool);
      if (analysis.suggestions.length > 0) {
        this.showSuggestions(analysis.suggestions);
      }
      this.isAnalyzing = false;
    }, 1000); // Analyze after 1 second
  }

  performPatternAnalysis(timeLapse, currentTool) {
    const analysis = {
      suggestions: [],
      confidence: 0
    };

    // Analyze drawing speed
    if (timeLapse.length > 10) {
      const recentSteps = timeLapse.slice(-10);
      const timeSpan = recentSteps[recentSteps.length - 1].timestamp - recentSteps[0].timestamp;
      const avgSpeed = recentSteps.length / (timeSpan / 1000); // steps per second

      if (avgSpeed > 5) {
        analysis.suggestions.push({
          type: 'pace',
          message: '🎨 Try slowing down a bit to add more detail!',
          priority: 'medium'
        });
      }
    }

    // Analyze tool usage patterns
    const toolUsage = {};
    timeLapse.forEach(step => {
      const tool = step.tool || 'unknown';
      toolUsage[tool] = (toolUsage[tool] || 0) + 1;
    });

    // Suggest tool exploration
    if (Object.keys(toolUsage).length === 1 && timeLapse.length > 20) {
      analysis.suggestions.push({
        type: 'tools',
        message: '🌈 Try using different tools to make your art more interesting!',
        priority: 'low'
      });
    }

    // Detect if user is stuck (many undo actions)
    const recentUndos = timeLapse.slice(-5).filter(step => step.action === 'undo').length;
    if (recentUndos >= 3) {
      analysis.suggestions.push({
        type: 'encouragement',
        message: '💪 Don\'t worry about mistakes - they help you learn!',
        priority: 'high'
      });
    }

    return analysis;
  }

  // Check if user has been inactive and might need encouragement
  checkForInactivity() {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    
    if (timeSinceLastActivity > this.progressThreshold) {
      return {
        needsHelp: true,
        suggestion: {
          type: 'encouragement',
          message: '✨ Take your time! What would you like to draw next?',
          priority: 'medium'
        }
      };
    }
    
    return { needsHelp: false };
  }

  // Analyze completed drawing and provide feedback
  async analyzeCompletedDrawing(canvasData, timeLapse) {
    try {
      const feedback = {
        score: 0,
        strengths: [],
        suggestions: [],
        achievements: []
      };

      // Analyze time-lapse for completion metrics
      if (timeLapse && timeLapse.length > 0) {
        const totalTime = this.calculateDrawingTime(timeLapse);
        const toolsUsed = this.getUniqueTools(timeLapse);
        const complexity = this.calculateComplexity(timeLapse);

        // Generate feedback based on analysis
        feedback.score = Math.min(50 + (toolsUsed.length * 10) + (complexity * 20), 100);

        if (toolsUsed.length >= 3) {
          feedback.strengths.push('🎨 Great tool exploration!');
        }

        if (totalTime > 60) { // More than 1 minute
          feedback.strengths.push('⏰ Wonderful attention to detail!');
        }

        if (complexity > 0.7) {
          feedback.achievements.push('🏆 Complexity Master');
        }

        if (toolsUsed.includes('rainbow')) {
          feedback.achievements.push('🌈 Rainbow Artist');
        }
      }

      // Always provide encouraging feedback
      if (feedback.strengths.length === 0) {
        feedback.strengths.push('✨ Beautiful creative expression!');
      }

      return feedback;
    } catch (error) {
      console.error('Error analyzing drawing:', error);
      return {
        score: 75,
        strengths: ['🎨 Amazing artwork!'],
        suggestions: [],
        achievements: []
      };
    }
  }

  calculateDrawingTime(timeLapse) {
    if (timeLapse.length < 2) return 0;
    const start = timeLapse[0].timestamp;
    const end = timeLapse[timeLapse.length - 1].timestamp;
    return (end - start) / 1000; // seconds
  }

  getUniqueTools(timeLapse) {
    const tools = new Set();
    timeLapse.forEach(step => {
      if (step.tool) tools.add(step.tool);
    });
    return Array.from(tools);
  }

  calculateComplexity(timeLapse) {
    // Simple complexity based on number of actions and variety
    const actionCount = timeLapse.length;
    const toolCount = this.getUniqueTools(timeLapse).length;
    return Math.min((actionCount / 100) + (toolCount / 10), 1.0);
  }

  showSuggestions(suggestions) {
    // This could trigger UI notifications
    suggestions.forEach(suggestion => {
      if (suggestion.priority === 'high') {
        console.log('AI Suggestion (High Priority):', suggestion.message);
        // Could trigger a toast notification here
      }
    });
  }

  // Get personalized hints based on user's drawing history
  async getPersonalizedHints(questId = null) {
    try {
      const response = await apiClient.get(`/ai/drawing-hints?quest_id=${questId || ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hints:', error);
      return {
        hints: ['🎨 Keep practicing and have fun!'],
        skill_level: 'beginner',
        personalized: false
      };
    }
  }

  // Get user's interest analysis
  async getUserInterests() {
    try {
      const response = await apiClient.get('/ai/interests');
      return response.data;
    } catch (error) {
      console.error('Error fetching interests:', error);
      return { interests: {}, top_interests: [] };
    }
  }

  // Get personalized recommendations
  async getRecommendations() {
    try {
      const response = await apiClient.get('/ai/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { recommendations: [] };
    }
  }

  // Analyze specific drawing
  async analyzeDrawing(drawingId) {
    try {
      const response = await apiClient.post('/ai/analyze-drawing', {
        drawing_id: drawingId
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing drawing:', error);
      return null;
    }
  }
}

// Export singleton instance
export const aiAssistance = new AIAssistanceService();
export default aiAssistance;