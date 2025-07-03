import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { drawingService } from '../services/drawingService';
import { questService } from '../services/questService';
import LoadingSpinner from './LoadingSpinner';

const ParentPortal = ({ user }) => {
  const [childDrawings, setChildDrawings] = useState([]);
  const [childProgress, setChildProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChildData();
  }, []);

  const fetchChildData = async () => {
    try {
      // In a real implementation, you would fetch data for child accounts
      // linked to this parent account
      const [drawings, progress] = await Promise.all([
        drawingService.getUserDrawings(),
        questService.getUserProgress()
      ]);
      
      setChildDrawings(drawings);
      setChildProgress(progress);
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateProgressReport = () => {
    const completedQuests = childProgress.filter(p => p.status === 'completed').length;
    const totalBadges = childProgress.reduce((acc, p) => acc + p.badges_earned.length, 0);
    const totalDrawings = childDrawings.length;
    
    return {
      completedQuests,
      totalBadges,
      totalDrawings,
      averageProgress: childProgress.length > 0 
        ? Math.round(childProgress.reduce((acc, p) => acc + p.completion_percentage, 0) / childProgress.length)
        : 0
    };
  };

  const stats = generateProgressReport();

  const TabButton = ({ tabId, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
        isActive 
          ? 'bg-draw-primary text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return <LoadingSpinner message="Loading parent portal..." />;
  }

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-logo">Parent Portal</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-child btn-secondary text-sm px-4 py-2"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-child-title text-gray-800 mb-4">
              Parent Portal
            </h1>
            <p className="text-child-body text-gray-600">
              Track your child's creative journey and progress
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 bg-gray-50 rounded-lg p-2">
              <TabButton
                tabId="overview"
                label="Overview"
                isActive={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
              <TabButton
                tabId="drawings"
                label="Artwork"
                isActive={activeTab === 'drawings'}
                onClick={() => setActiveTab('drawings')}
              />
              <TabButton
                tabId="progress"
                label="Progress"
                isActive={activeTab === 'progress'}
                onClick={() => setActiveTab('progress')}
              />
              <TabButton
                tabId="tools"
                label="Tools"
                isActive={activeTab === 'tools'}
                onClick={() => setActiveTab('tools')}
              />
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-draw-primary mb-2">
                    {stats.totalDrawings}
                  </div>
                  <div className="text-gray-600">Total Drawings</div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-draw-secondary mb-2">
                    {stats.completedQuests}
                  </div>
                  <div className="text-gray-600">Quests Completed</div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-draw-accent mb-2">
                    {stats.totalBadges}
                  </div>
                  <div className="text-gray-600">Badges Earned</div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stats.averageProgress}%
                  </div>
                  <div className="text-gray-600">Average Progress</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                {childDrawings.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No drawings created yet. Encourage your child to start drawing!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {childDrawings.slice(0, 5).map((drawing) => (
                      <div key={drawing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{drawing.title}</div>
                          <div className="text-sm text-gray-600">
                            Created on {formatDate(drawing.created_at)}
                          </div>
                        </div>
                        <button className="btn-child btn-primary text-sm px-4 py-2">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'drawings' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Child's Artwork Collection</h3>
              {childDrawings.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-600">No artwork created yet</p>
                </div>
              ) : (
                <div className="gallery-grid">
                  {childDrawings.map((drawing) => (
                    <div key={drawing.id} className="gallery-item">
                      <div className="gallery-item-image bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <div className="gallery-item-info">
                        <h4 className="gallery-item-title">{drawing.title}</h4>
                        <p className="gallery-item-date">
                          {formatDate(drawing.created_at)}
                        </p>
                        <div className="mt-4 space-y-2">
                          <button className="btn-child btn-primary text-sm px-3 py-1 w-full">
                            View Details
                          </button>
                          <button className="btn-child btn-secondary text-sm px-3 py-1 w-full">
                            Email to Me
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Learning Progress</h3>
              {childProgress.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600">No progress data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {childProgress.map((progress) => (
                    <div key={progress.id} className="card p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold">Quest ID: {progress.quest_id}</h4>
                          <p className="text-sm text-gray-600">
                            Status: {progress.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-draw-primary">
                            {Math.round(progress.completion_percentage)}%
                          </div>
                          <div className="text-sm text-gray-600">Complete</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-draw-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.completion_percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Badges */}
                      {progress.badges_earned.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">Badges Earned:</div>
                          <div className="flex flex-wrap gap-2">
                            {progress.badges_earned.map((badge, index) => (
                              <span key={index} className="bg-draw-secondary text-white px-2 py-1 rounded-full text-sm">
                                🏆 {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Parent Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">Custom Tracing Pages</h4>
                  <p className="text-gray-600 mb-4">
                    Create personalized tracing activities for your child
                  </p>
                  <button className="btn-child btn-primary">
                    Create Tracing Page
                  </button>
                </div>
                
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">Email Digest</h4>
                  <p className="text-gray-600 mb-4">
                    Get weekly updates on your child's progress and artwork
                  </p>
                  <button className="btn-child btn-secondary">
                    Setup Email Digest
                  </button>
                </div>
                
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">AI Insights</h4>
                  <p className="text-gray-600 mb-4">
                    Get fun interpretations of your child's artwork (for entertainment only)
                  </p>
                  <button className="btn-child btn-accent">
                    View AI Insights
                  </button>
                </div>
                
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">Settings</h4>
                  <p className="text-gray-600 mb-4">
                    Manage account settings and preferences
                  </p>
                  <button className="btn-child btn-secondary">
                    Manage Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;