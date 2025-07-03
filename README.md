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

## 🎯 Current Status: Phase 1 Complete

✅ **Core Infrastructure**
- FastAPI backend with MongoDB integration
- React frontend with routing and authentication
- Paper.js drawing canvas with basic tools
- User management and JWT authentication
- Drawing storage and retrieval system
- Basic quest system with placeholder data
- Parent portal foundation
- Supervisor-based service management

### What's Working
- User registration and login
- Drawing canvas with multiple tools (pencil, marker, eraser)
- Drawing saving and gallery viewing
- Quest map navigation
- Parent portal access
- API authentication and data persistence

### Next Phases
- **Phase 2**: Advanced drawing features (rainbow brush, advanced tools)
- **Phase 3**: AI story generation integration
- **Phase 4**: Enhanced parent portal features
- **Phase 5**: Polish and production deployment

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
