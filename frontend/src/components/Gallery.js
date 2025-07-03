import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { drawingService } from '../services/drawingService';
import LoadingSpinner from './LoadingSpinner';

const Gallery = ({ user }) => {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const userDrawings = await drawingService.getUserDrawings();
      setDrawings(userDrawings);
    } catch (error) {
      setError('Failed to load drawings');
      console.error('Error fetching drawings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateThumbnail = (canvasData) => {
    // Create a simple placeholder for now
    // In a real implementation, you would render the canvas data to a thumbnail
    return "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='100' y='75' text-anchor='middle' font-family='Arial' font-size='14' fill='%23374151'%3EDrawing%3C/text%3E%3C/svg%3E";
  };

  if (loading) {
    return <LoadingSpinner message="Loading your gallery..." />;
  }

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-logo">My Gallery</div>
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
              {user.username}'s Art Gallery
            </h1>
            <p className="text-child-body text-gray-600">
              Your amazing artwork collection
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="card p-6 mb-8 bg-red-50 border-red-200">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {drawings.length === 0 && !error && (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No drawings yet!
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first masterpiece to get started
              </p>
              <button
                onClick={() => navigate('/draw')}
                className="btn-child btn-primary"
              >
                Start Drawing
              </button>
            </div>
          )}

          {/* Gallery Grid */}
          {drawings.length > 0 && (
            <div className="gallery-grid">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="gallery-item">
                  <div className="gallery-item-image bg-gray-100 flex items-center justify-center">
                    <img
                      src={generateThumbnail(drawing.canvas_data)}
                      alt={drawing.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="gallery-item-info">
                    <h3 className="gallery-item-title">{drawing.title}</h3>
                    <p className="gallery-item-date">
                      {formatDate(drawing.created_at)}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          // TODO: Implement view/edit functionality
                          console.log('View drawing:', drawing.id);
                        }}
                        className="btn-child btn-primary text-sm px-3 py-1 flex-1"
                      >
                        View
                      </button>
                      {drawing.time_lapse && drawing.time_lapse.length > 0 && (
                        <button
                          onClick={() => {
                            // TODO: Implement time-lapse playback
                            console.log('Play time-lapse:', drawing.id);
                          }}
                          className="btn-child btn-secondary text-sm px-3 py-1 flex-1"
                        >
                          ▶ Play
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/draw')}
              className="btn-child btn-primary mr-4"
            >
              Create New Drawing
            </button>
            <button
              onClick={() => navigate('/quests')}
              className="btn-child btn-secondary"
            >
              Explore Quests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;