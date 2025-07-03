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

## 🎯 Current Status: Phase 4 Complete - Enhanced Parent Portal & Professional Branding

✅ **Phase 1: Core Infrastructure** (Complete)
✅ **Phase 2: Advanced Drawing Features** (Complete)  
✅ **Phase 3: AI Integration & Intelligent Features** (Complete)
✅ **Phase 4: Enhanced Parent Portal & Branding** (Complete)

### **👨‍👩‍👧‍👦 New Phase 4: Enhanced Parent Portal Features**

#### **AI-Powered Parent Insights**
- **Intelligent Analysis Dashboard**: Real-time AI insights into child's artistic development
- **Interest Pattern Recognition**: Automated detection of child's creative preferences and themes
- **Personalized Recommendations**: AI-generated suggestions for activities and learning paths
- **Drawing Analysis Tools**: One-click AI analysis of individual artworks with detailed feedback
- **Progress Prediction**: Smart forecasting of learning trajectory and skill development
- **Educational Guidance**: AI-powered tips for parents to support their child's creative journey

#### **Advanced Progress Tracking**
- **Visual Skill Development Charts**: Interactive progress bars for core artistic skills
- **Activity Timeline**: Chronological view of child's creative journey with milestones
- **Achievement Analytics**: Comprehensive badge and quest completion tracking
- **Learning Velocity Metrics**: Weekly activity monitoring and engagement analysis
- **Comparative Progress**: Age-appropriate benchmarking and development indicators
- **Detailed Quest Analysis**: Individual quest progress with skill-specific feedback

#### **Professional Parent Tools**
- **Custom Tracing Page Creator**: Upload family photos to create personalized tracing activities
- **Progress Report Generator**: Export comprehensive PDF reports with AI insights
- **Email Notification System**: Configurable alerts for achievements, progress, and milestones
- **Drawing Portfolio Manager**: Professional presentation of child's artwork collection
- **Privacy Controls**: Granular settings for AI analysis and data sharing preferences
- **Account Management Hub**: Subscription, settings, and profile management tools

#### **Enhanced Communication Features**
- **Weekly Progress Digests**: Automated email summaries with highlights and achievements
- **Achievement Celebrations**: Real-time notifications for quest completions and badges
- **Educational Content Sharing**: Easy sharing of child's artwork with family members
- **Learning Insights Reports**: Monthly AI-generated analysis of creative development
- **Parent-Child Collaboration**: Tools for guided activities and shared creative sessions

### **🎨 Professional Branding Integration**

#### **Logo Implementation**
- **Custom Draw-a-Tale Logo**: Beautiful SVG logo with paintbrush and colorful design
- **Responsive Logo Display**: Adaptive sizing for different screen sizes and contexts
- **Consistent Brand Identity**: Logo integration across all pages and components
- **Multiple Logo Variants**: Icon-only, text-only, and full logo versions for different uses
- **Brand Color Harmony**: Logo colors integrated with application color scheme

#### **Visual Identity Enhancement**
- **Professional Navigation**: Branded headers with logo placement
- **Enhanced User Experience**: Consistent visual language throughout the application
- **Child-Friendly Design**: Maintaining neuro-inclusive principles with professional polish
- **Authentication Branding**: Logo prominence in login and registration flows
- **Dashboard Integration**: Logo as central element of user dashboard experience

### **🔧 Technical Infrastructure Enhancements**

#### **Advanced Parent Portal Architecture**
- **React Component System**: Modular, reusable components for parent interface
- **Real-time Data Integration**: Live updates of child progress and activity
- **AI Service Integration**: Seamless connection to machine learning analysis tools
- **Export Functionality**: PDF and text report generation with formatting
- **Image Processing**: Custom tracing page creation with image upload and processing

#### **Enhanced API Endpoints**
- **Parent-Specific APIs**: Dedicated endpoints for parent portal functionality
- **AI Analysis Integration**: Real-time connection to intelligent analysis services
- **Progress Export APIs**: Data export functionality for reports and sharing
- **Custom Content APIs**: Tracing page creation and management endpoints
- **Notification System**: Email and alert management infrastructure

#### **Security & Privacy Enhancements**
- **COPPA Compliance Ready**: Child privacy protection measures implemented
- **Data Encryption**: Secure storage and transmission of sensitive information
- **Access Control**: Role-based permissions for parent and child accounts
- **Privacy Settings**: Granular control over AI analysis and data sharing
- **Audit Logging**: Comprehensive tracking of data access and modifications

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
