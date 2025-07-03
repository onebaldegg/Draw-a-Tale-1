# Draw-a-Tale: Begin Your Artist's Journey

An educational drawing application that empowers children of all neurological profiles to build artistic skills and creative confidence through AI-powered storytelling and gamified learning.

## 🎨 Vision

To create the most engaging, supportive, and inspiring educational drawing application in the world, empowering children of all neurological profiles to build artistic skills and creative confidence.

## 🌟 Key Features

### Core Drawing Experience
- **Interactive Canvas**: Paper.js-powered drawing interface with professional tools
- **Drawing Tools**: Pencil, marker, rainbow brush, eraser, and paint bucket
- **Time-lapse Recording**: Capture and replay the drawing creation process
- **Undo/Redo System**: Multi-step drawing history management
- **Auto-save**: Automatic drawing preservation

### AI-Powered Storytelling
- **Story Generation**: AI creates personalized stories based on child's prompts
- **Drawing Challenges**: Each story page includes specific drawing prompts
- **Adaptive Content**: AI learns from child's interests and preferences
- **Progress Detection**: Real-time assistance and hints when needed

### Gamified Learning System
- **Quest Map**: Visual progression through structured art curriculum
- **Badge System**: Achievement rewards for skill mastery and effort
- **World Map**: Interactive journey through art education milestones
- **Personalized Challenges**: Content adapted to individual interests

### Parent Portal
- **Progress Tracking**: Comprehensive dashboard of child's artistic journey
- **Custom Tracing Pages**: Tool for creating personalized activities
- **Email Digests**: Weekly artwork and progress updates
- **AI Insights**: Fun interpretations of child's artwork (entertainment only)

### Neuro-Inclusive Design
- **Sensory-Friendly UI**: Minimalist design with customizable elements
- **Non-Punitive Feedback**: Positive reinforcement and error-free environment
- **Predictable Navigation**: Consistent layout and interaction patterns
- **Special Interest Integration**: Content tailored to child's passions

## 🏗️ Technical Architecture

### Backend (FastAPI + Python)
- **API Server**: RESTful APIs for all application functionality
- **Database**: MongoDB for flexible data storage
- **Authentication**: JWT-based secure user management
- **AI Integration**: Placeholder for OpenAI/Anthropic integration

### Frontend (React + Paper.js)
- **User Interface**: Modern React application with responsive design
- **Drawing Canvas**: Paper.js for professional drawing capabilities
- **State Management**: Context and hooks for application state
- **Real-time Features**: TensorFlow.js for progress detection

### Infrastructure
- **Supervisor**: Process management for backend and frontend services
- **MongoDB**: Document database for user data and drawings
- **Environment Configuration**: Secure API key and configuration management

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- Yarn package manager

### Installation & Setup

1. **Clone and Navigate**
   ```bash
   cd /app
   ```

2. **Start All Services**
   ```bash
   ./scripts/start_services.sh
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

### Development

**Backend Development**
```bash
cd backend
python server.py
```

**Frontend Development**
```bash
cd frontend
yarn start
```

**Service Management**
```bash
# Restart all services
sudo supervisorctl restart all

# Check service status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/frontend.out.log
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Drawings
- `GET /api/drawings` - Get user drawings
- `POST /api/drawings` - Create new drawing
- `GET /api/drawings/{id}` - Get specific drawing

### Stories & Quests
- `GET /api/stories` - Get user stories
- `POST /api/stories` - Create new story
- `GET /api/quests` - Get available quests
- `GET /api/progress` - Get user progress

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
- `MONGO_URL` - MongoDB connection string
- `SECRET_KEY` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key (placeholder)
- `ANTHROPIC_API_KEY` - Anthropic API key (placeholder)
- `MAILCHIMP_API_KEY` - Mailchimp API key (placeholder)

**Frontend (.env)**
- `REACT_APP_BACKEND_URL` - Backend server URL
- `REACT_APP_API_BASE_URL` - API base URL

## 🧪 Testing

### API Testing Examples

```bash
# Register a new user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "child@example.com", "username": "artist", "password": "password123", "user_type": "child", "age": 8}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "child@example.com", "password": "password123"}'

# Create a drawing (requires auth token)
curl -X POST http://localhost:8001/api/drawings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "My Drawing", "canvas_data": {"paperjs": "data"}, "time_lapse": []}'
```

## 🎯 Current Status: Phase 3 Complete - AI Integration & Intelligent Features

✅ **Phase 1: Core Infrastructure** (Complete)
✅ **Phase 2: Advanced Drawing Features** (Complete)  
✅ **Phase 3: AI Integration & Intelligent Features** (Complete)

### **🤖 New Phase 3: AI Integration Features**

#### **AI-Powered Story Generation**
- **Smart Story Creation**: AI generates personalized stories based on child's prompt
- **Age-Appropriate Content**: Stories tailored to child's age and interests
- **Drawing Prompts**: Each story page includes specific drawing challenges
- **Interest-Based Customization**: Stories adapt to detected interests (dinosaurs, space, etc.)
- **Fallback System**: Template-based stories when AI APIs are unavailable
- **Story Persistence**: All generated stories saved to user's collection

#### **Intelligent Progress Analysis**
- **Real-time Drawing Monitoring**: TensorFlow.js-powered progress detection
- **Pattern Recognition**: Analyzes drawing speed, tool usage, and complexity
- **Smart Suggestions**: Context-aware hints and encouragement
- **Skill Assessment**: Automatic skill level detection (beginner/intermediate/advanced)
- **Drawing Completion Analysis**: AI feedback on finished artwork
- **Achievement Recognition**: Automatic badge assignment based on progress

#### **Personalized Interest Detection**
- **Drawing Pattern Analysis**: AI analyzes titles and descriptions to identify interests
- **Interest Categories**: 11+ categories including animals, space, dinosaurs, magic
- **Adaptive Recommendations**: Quest and story suggestions based on detected interests
- **Learning Progression**: Content difficulty adapts to skill level
- **Preference Learning**: System learns from child's choices over time

#### **AI Assistant Integration**
- **Real-time Assistance**: Floating AI panel with contextual help
- **Quest-Specific Hints**: Tailored advice for each learning objective
- **Progress Monitoring**: Visual feedback on drawing steps and tool usage
- **Smart Encouragement**: Automatic motivation when user seems stuck
- **Tool Recommendations**: Suggestions for unexplored drawing tools
- **Performance Feedback**: Detailed analysis of completed drawings

#### **Enhanced Story System**
- **Template Engine**: Intelligent story generation without API dependencies
- **Character Detection**: Smart character selection based on prompt themes
- **Setting Analysis**: Automatic scene setting based on story elements
- **Educational Integration**: Stories designed to teach artistic concepts
- **Multi-page Structure**: 3-page format perfect for illustration
- **Theme Extraction**: Automatic identification of story themes and concepts

### **🔧 Technical AI Infrastructure**

#### **Backend AI Services**
- **OpenAI Integration**: GPT-3.5-turbo for advanced story generation
- **Anthropic Support**: Claude API as backup for story creation
- **Scikit-learn Analytics**: ML-powered interest pattern analysis
- **TensorFlow Integration**: Server-side model support for complex analysis
- **Fallback Systems**: Graceful degradation when AI services unavailable

#### **Frontend AI Features**
- **TensorFlow.js**: Real-time drawing progress analysis
- **AI Service Layer**: Clean API abstraction for all AI features
- **Smart Caching**: Efficient storage of AI responses and analysis
- **Progressive Enhancement**: AI features enhance but don't block core functionality
- **User Experience**: Seamless integration without disrupting creative flow

#### **Intelligence APIs**
- **Interest Analysis**: `/api/ai/interests` - Analyze user drawing patterns
- **Smart Recommendations**: `/api/ai/recommendations` - Personalized content suggestions  
- **Drawing Analysis**: `/api/ai/analyze-drawing` - Detailed drawing feedback
- **Contextual Hints**: `/api/ai/drawing-hints` - Smart tips and guidance
- **Story Generation**: `/api/stories/generate` - AI-powered story creation

## 🔐 Security & Privacy

- COPPA compliance ready (implementation pending)
- JWT-based authentication
- Encrypted data storage
- Secure API endpoints
- Child-safe design principles

## 📱 Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## 🤝 Contributing

This is an educational application designed with neuro-inclusive principles. All contributions should align with child safety and accessibility guidelines.

## 📄 License

Educational use license - designed for children's creative development and learning.
