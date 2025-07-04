import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { drawingService } from '../services/drawingService';
import LoadingSpinner from './LoadingSpinner';
import DrawATaleLogo from './DrawATaleLogo';
import paper from 'paper';

const Gallery = ({ user }) => {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or detail
  const [isPlayingTimeLapse, setIsPlayingTimeLapse] = useState(false);
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
    // Check for existing thumbnail
    if (canvasData && canvasData.thumbnail) {
      return canvasData.thumbnail;
    }
    
    // Check for SVG data
    if (canvasData && canvasData.svg) {
      // Create a data URL from the SVG
      const svgBlob = new Blob([canvasData.svg], { type: 'image/svg+xml' });
      return URL.createObjectURL(svgBlob);
    }
    
    // Check for Paper.js project data
    if (canvasData && canvasData.paperjs) {
      // Try to render Paper.js data (this would need Paper.js to be loaded)
      try {
        // This is a placeholder for Paper.js rendering
        console.log('Paper.js data found but rendering not implemented yet');
      } catch (error) {
        console.error('Error rendering Paper.js data:', error);
      }
    }
    
    // Check for any base64 image data
    if (canvasData && canvasData.image) {
      return canvasData.image;
    }
    
    // Debug: Log the canvas data structure to console
    console.log('Canvas data structure:', canvasData);
    
    // Fallback SVG thumbnail
    return "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f8fafc'/%3E%3Cpath d='M40 60 Q60 40, 80 60 T120 60' stroke='%236366f1' stroke-width='3' fill='none'/%3E%3Ctext x='100' y='130' text-anchor='middle' font-family='Arial' font-size='12' fill='%23374151'%3E🎨 Artwork%3C/text%3E%3C/svg%3E";
  };

  const viewDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setViewMode('detail');
  };

  const playTimeLapse = async (drawing) => {
    if (!drawing.time_lapse || drawing.time_lapse.length === 0) {
      alert('No time-lapse data available for this drawing');
      return;
    }

    setIsPlayingTimeLapse(true);
    
    // Create a temporary canvas for playback
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    // Set up Paper.js with the temporary canvas
    const scope = new paper.PaperScope();
    scope.setup(canvas);
    
    // Clear canvas
    scope.project.clear();
    
    // Play back the time-lapse
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= drawing.time_lapse.length) {
        clearInterval(interval);
        setIsPlayingTimeLapse(false);
        alert('🎬 Time-lapse playback complete!');
        return;
      }
      
      const step = drawing.time_lapse[stepIndex];
      if (step.state) {
        scope.project.importJSON(step.state);
        scope.view.draw();
      }
      
      stepIndex++;
    }, 150); // Slower playback for better viewing
  };

  const downloadDrawing = (drawing) => {
    if (drawing.canvas_data && drawing.canvas_data.svg) {
      const blob = new Blob([drawing.canvas_data.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${drawing.title}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const DrawingDetailModal = ({ drawing, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{drawing.title}</h3>
              <p className="text-gray-600">{formatDate(drawing.created_at)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Drawing Display */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-96">
              {drawing.canvas_data && drawing.canvas_data.svg ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: drawing.canvas_data.svg }}
                  className="max-w-full max-h-full"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <div className="mb-4 flex justify-center">
                    <DrawATaleLogo width={80} height={80} variant="icon-only" />
                  </div>
                  <p>Drawing preview not available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drawing.time_lapse && drawing.time_lapse.length > 0 && (
              <button
                onClick={() => playTimeLapse(drawing)}
                disabled={isPlayingTimeLapse}
                className="btn-child btn-primary text-center"
              >
                {isPlayingTimeLapse ? '🎬 Playing...' : '▶️ Play Time-lapse'}
              </button>
            )}
            
            <button
              onClick={() => downloadDrawing(drawing)}
              className="btn-child btn-secondary text-center"
            >
              💾 Download
            </button>
            
            <button
              onClick={() => {
                // TODO: Navigate to edit mode
                navigate('/draw', { state: { editDrawing: drawing } });
              }}
              className="btn-child btn-accent text-center"
            >
              ✏️ Edit
            </button>
          </div>
          
          {/* Drawing Info */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Drawing Details</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Created:</strong> {formatDate(drawing.created_at)}</div>
              {drawing.quest_id && (
                <div><strong>Quest:</strong> {drawing.quest_id}</div>
              )}
              <div><strong>Time-lapse Steps:</strong> {drawing.time_lapse ? drawing.time_lapse.length : 0}</div>
              {drawing.description && (
                <div><strong>Description:</strong> {drawing.description}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading your gallery..." />;
  }

  return (
    <div className="min-h-screen bg-purple-600" style={{ backgroundColor: '#8A2BE2' }}>
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200"
          >
            ← Back
          </button>
          <div className="nav-logo-centered">
            <div className="child-header-font">My Gallery</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-draw-primary text-white' : 'bg-gray-200'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-draw-primary text-white' : 'bg-gray-200'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="child-header-white mb-4">
              {user.username}'s Art Gallery
            </h1>
            <p className="text-child-body text-white">
              Your amazing artwork collection ({drawings.length} drawings)
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
              <div className="mb-4 flex justify-center">
                <DrawATaleLogo width={100} height={100} variant="icon-only" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No drawings yet!
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first masterpiece to get started
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/draw')}
                  className="btn-child btn-primary"
                >
                  Start Drawing
                </button>
                <button
                  onClick={() => navigate('/quests')}
                  className="btn-child btn-secondary"
                >
                  Try a Quest
                </button>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {drawings.length > 0 && viewMode === 'grid' && (
            <div className="gallery-grid">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="gallery-item">
                  <div className="gallery-item-image bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={generateThumbnail(drawing.canvas_data)}
                      alt={drawing.title}
                      className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
                      style={{ minHeight: '120px' }}
                    />
                  </div>
                  <div className="gallery-item-info">
                    <h3 className="gallery-item-title">{drawing.title}</h3>
                    <p className="gallery-item-date">
                      {formatDate(drawing.created_at)}
                    </p>
                    {drawing.quest_id && (
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-2">
                        🎯 Quest Drawing
                      </div>
                    )}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => viewDrawing(drawing)}
                        className="btn-child btn-primary text-sm px-3 py-1 w-full"
                      >
                        View Details
                      </button>
                      {drawing.time_lapse && drawing.time_lapse.length > 0 && (
                        <button
                          onClick={() => playTimeLapse(drawing)}
                          disabled={isPlayingTimeLapse}
                          className="btn-child btn-secondary text-sm px-3 py-1 w-full"
                        >
                          {isPlayingTimeLapse ? '🎬 Playing...' : '▶️ Play Time-lapse'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gallery List */}
          {drawings.length > 0 && viewMode === 'list' && (
            <div className="space-y-4">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="card p-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-18 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={generateThumbnail(drawing.canvas_data)}
                        alt={drawing.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{drawing.title}</h3>
                      <p className="text-gray-600">{formatDate(drawing.created_at)}</p>
                      {drawing.description && (
                        <p className="text-sm text-gray-500 mt-1">{drawing.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        {drawing.quest_id && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            🎯 Quest
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {drawing.time_lapse ? drawing.time_lapse.length : 0} steps
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewDrawing(drawing)}
                        className="btn-child btn-primary text-sm px-4 py-2"
                      >
                        View
                      </button>
                      {drawing.time_lapse && drawing.time_lapse.length > 0 && (
                        <button
                          onClick={() => playTimeLapse(drawing)}
                          disabled={isPlayingTimeLapse}
                          className="btn-child btn-secondary text-sm px-4 py-2"
                        >
                          ▶️
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

      {/* Drawing Detail Modal */}
      {selectedDrawing && viewMode === 'detail' && (
        <DrawingDetailModal
          drawing={selectedDrawing}
          onClose={() => {
            setSelectedDrawing(null);
            setViewMode('grid');
          }}
        />
      )}
    </div>
  );
};

export default Gallery;