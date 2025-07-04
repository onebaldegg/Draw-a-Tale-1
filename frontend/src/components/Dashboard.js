import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DrawATaleLogo from './DrawATaleLogo';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const dashboardItems = [
    {
      title: 'Start Drawing',
      description: 'Create a new artwork with our magical drawing tools',
      icon: '🎨',
      path: '/draw',
      color: 'bg-draw-primary'
    },
    {
      title: 'My Gallery',
      description: 'View and replay your amazing artwork collection',
      icon: '🖼️',
      path: '/gallery',
      color: 'bg-red-600'
    },
    {
      title: 'Quest Map',
      description: 'Explore new drawing adventures and earn badges',
      icon: '🗺️',
      path: '/quests',
      color: 'bg-draw-accent'
    }
  ];

  if (user.user_type === 'parent') {
    dashboardItems.push({
      title: 'Parent Portal',
      description: 'Track progress and manage your child\'s journey',
      icon: '👨‍👩‍👧‍👦',
      path: '/parent-portal',
      color: 'bg-purple-500'
    });
  }

  return (
    <div className="min-h-screen bg-purple-600" style={{ backgroundColor: '#8A2BE2' }}>
      {/* Full Black Header - Extended Height */}
      <header className="bg-black w-full" style={{ height: '140px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
          {/* Logo section */}
          <div className="flex items-center">
            <img 
              src="https://i.imgur.com/3QxT3zD.png" 
              alt="Draw-a-Tale Logo" 
              className="h-20 w-auto"
            />
          </div>
          
          {/* Right side with white text */}
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium">Welcome, {user.username}!</span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-lg font-semibold text-black hover:opacity-80 transition-all duration-200"
              style={{ backgroundColor: '#FFC107' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="rainbow-kaleidoscope-enhanced rounded-2xl mb-12">
            <div className="hero-section rounded-2xl">
              <h1 className="hero-title">
                {user.user_type === 'child' 
                  ? `Ready to Create, ${user.username}?` 
                  : `Welcome to Your Portal, ${user.username}!`
                }
              </h1>
              <p className="hero-subtitle">
                {user.user_type === 'child' 
                  ? 'Let your imagination soar with magical drawing adventures!'
                  : 'Monitor progress, create custom activities, and celebrate creativity!'
                }
              </p>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {dashboardItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="dashboard-card hover:shadow-2xl rainbow-kaleidoscope-frame"
                style={{ backgroundColor: '#FFC107' }}
              >
                <div className={`dashboard-card-icon ${item.color} text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold`}>
                  {item.icon}
                </div>
                <h3 className="dashboard-card-title">{item.title}</h3>
                <p className="dashboard-card-description">{item.description}</p>
                <div className="text-sm px-4 py-2 rounded-lg font-bold text-white hover:opacity-80 transition-all duration-200" style={{ backgroundColor: '#4F46E5' }}>
                  Get Started
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats for Child Users */}
          {user.user_type === 'child' && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-draw-primary mb-2">0</div>
                <div className="text-gray-600">Drawings Created</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-draw-secondary mb-2">0</div>
                <div className="text-gray-600">Badges Earned</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-draw-accent mb-2">0</div>
                <div className="text-gray-600">Quests Completed</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;