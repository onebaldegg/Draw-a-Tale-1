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
      color: 'bg-draw-secondary'
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
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo section with black background */}
          <div className="bg-black px-6 py-2 rounded-lg">
            <DrawATaleLogo width={180} showTagline={false} />
          </div>
          
          {/* Right side with black background for white text */}
          <div className="flex items-center space-x-4 bg-black px-6 py-2 rounded-lg">
            <span className="text-white font-medium">Welcome, {user.username}!</span>
            <button
              onClick={handleLogout}
              className="btn-child btn-secondary text-sm px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section rounded-2xl mb-12">
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

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {dashboardItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="dashboard-card hover:shadow-2xl"
              >
                <div className={`dashboard-card-icon ${item.color} text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl`}>
                  {item.icon}
                </div>
                <h3 className="dashboard-card-title">{item.title}</h3>
                <p className="dashboard-card-description">{item.description}</p>
                <div className="btn-child btn-primary text-sm px-4 py-2">
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