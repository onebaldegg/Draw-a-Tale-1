import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paper from 'paper';
import { drawingService } from '../services/drawingService';
import { aiAssistance } from '../services/aiService';

const DrawingCanvas = ({ user }) => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLapse, setTimeLapse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState('');
  const [rainbowHue, setRainbowHue] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  const [isPlaying, setIsPlaying] = useState(false);
  const [questContext, setQuestContext] = useState(null);
  const [storyContext, setStoryContext] = useState(null);
  const [aiHints, setAiHints] = useState([]);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);

  useEffect(() => {
    // Initialize AI assistance
    const initAI = async () => {
      const initialized = await aiAssistance.initialize();
      setAiInitialized(initialized);
    };
    initAI();

    // Check if we're coming from a quest or story
    if (location.state) {
      if (location.state.questId) {
        setQuestContext(location.state);
        setDrawingTitle(`Quest: ${location.state.questTitle}`);
        loadQuestHints(location.state.questId);
      } else if (location.state.storyMode) {
        setStoryContext(location.state);
        setDrawingTitle(`Story: ${location.state.story.title}`);
      }
    }
  }, [location.state]);

  const loadQuestHints = async (questId) => {
    try {
      const hints = await aiAssistance.getPersonalizedHints(questId);
      setAiHints(hints.hints || []);
    } catch (error) {
      console.error('Failed to load hints:', error);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize Paper.js
      paper.setup(canvasRef.current);
      
      // Set up initial drawing state
      const initialState = paper.project.exportJSON();
      setDrawingHistory([initialState]);
      setCurrentStep(0);
      
      // Set canvas background
      paper.view.onFrame = (event) => {
        // Update rainbow color if rainbow brush is active
        if (tool === 'rainbow' && isDrawing) {
          setRainbowHue((prevHue) => (prevHue + 2) % 360);
        }
      };
      
      // Clean up on unmount
      return () => {
        if (paper.project) {
          paper.project.clear();
        }
      };
    }
  }, []);

  const getColorForTool = () => {
    if (tool === 'rainbow') {
      return `hsl(${rainbowHue}, 80%, 60%)`;
    }
    return color;
  };

  const startDrawing = (event) => {
    if (!paper.project) return;
    
    setIsDrawing(true);
    const point = new paper.Point(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    
    // Record time-lapse step
    const timeStep = {
      timestamp: Date.now(),
      action: 'start',
      tool: tool,
      color: getColorForTool(),
      size: brushSize,
      point: { x: point.x, y: point.y }
    };
    const newTimeLapse = [...timeLapse, timeStep];
    setTimeLapse(newTimeLapse);
    
    // AI monitoring
    if (aiInitialized) {
      aiAssistance.monitorDrawingProgress(newTimeLapse, tool, true);
    }
    
    // Create new path based on selected tool
    if (tool === 'pencil' || tool === 'marker' || tool === 'rainbow') {
      const path = new paper.Path();
      path.strokeColor = getColorForTool();
      path.strokeWidth = brushSize;
      path.strokeCap = 'round';
      path.strokeJoin = 'round';
      
      if (tool === 'marker') {
        path.opacity = 0.7;
      } else if (tool === 'rainbow') {
        path.opacity = 0.8;
      }
      
      path.add(point);
      window.currentPath = path;
    } else if (tool === 'eraser') {
      // Enhanced eraser functionality
      const hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: brushSize
      };
      
      const hitResult = paper.project.hitTest(point, hitOptions);
      if (hitResult && hitResult.item) {
        hitResult.item.remove();
      }
    } else if (tool === 'bucket') {
      // Paint bucket tool - simplified implementation
      const circle = new paper.Path.Circle(point, brushSize * 2);
      circle.fillColor = getColorForTool();
      circle.opacity = 0.5;
    }
  };

  const draw = (event) => {
    if (!isDrawing || !paper.project) return;
    
    const point = new paper.Point(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    
    if (tool === 'pencil' || tool === 'marker' || tool === 'rainbow') {
      if (window.currentPath) {
        window.currentPath.add(point);
        
        // Update rainbow color dynamically
        if (tool === 'rainbow') {
          window.currentPath.strokeColor = getColorForTool();
        }
      }
    } else if (tool === 'eraser') {
      const hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: brushSize
      };
      
      const hitResult = paper.project.hitTest(point, hitOptions);
      if (hitResult && hitResult.item) {
        hitResult.item.remove();
      }
    }
    
    paper.view.draw();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    if (window.currentPath) {
      window.currentPath.simplify();
      window.currentPath = null;
    }
    
    // Save state for undo/redo
    const newState = paper.project.exportJSON();
    const newHistory = drawingHistory.slice(0, currentStep + 1);
    newHistory.push(newState);
    setDrawingHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
    
    // Record time-lapse step
    const timeStep = {
      timestamp: Date.now(),
      action: 'stop',
      state: newState
    };
    const newTimeLapse = [...timeLapse, timeStep];
    setTimeLapse(newTimeLapse);
    
    // AI monitoring
    if (aiInitialized) {
      aiAssistance.monitorDrawingProgress(newTimeLapse, tool, false);
    }
  };

  const undo = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      paper.project.importJSON(drawingHistory[prevStep]);
      setCurrentStep(prevStep);
      paper.view.draw();
    }
  };

  const redo = () => {
    if (currentStep < drawingHistory.length - 1) {
      const nextStep = currentStep + 1;
      paper.project.importJSON(drawingHistory[nextStep]);
      setCurrentStep(nextStep);
      paper.view.draw();
    }
  };

  const clearCanvas = () => {
    if (paper.project) {
      paper.project.clear();
      const newState = paper.project.exportJSON();
      setDrawingHistory([newState]);
      setCurrentStep(0);
      setTimeLapse([]);
      paper.view.draw();
    }
  };

  const exportCanvas = () => {
    if (!paper.project) return;
    
    // Export as SVG
    const svg = paper.project.exportSVG();
    const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${drawingTitle || 'drawing'}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const playTimeLapse = () => {
    if (timeLapse.length === 0) return;
    
    setIsPlaying(true);
    paper.project.clear();
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= timeLapse.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      
      const step = timeLapse[stepIndex];
      if (step.state) {
        paper.project.importJSON(step.state);
        paper.view.draw();
      }
      
      stepIndex++;
    }, 100);
  };

  const generateThumbnail = () => {
    if (!paper.project) return null;
    
    // Create a smaller canvas for thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Simple background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 150);
    
    // Return data URL
    return canvas.toDataURL();
  };

  const saveDrawing = async () => {
    if (!paper.project || !drawingTitle.trim()) {
      alert('Please enter a title for your drawing');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const canvasData = {
        paperjs: paper.project.exportJSON(),
        svg: paper.project.exportSVG().outerHTML,
        thumbnail: generateThumbnail(),
        width: canvasRef.current.width,
        height: canvasRef.current.height
      };
      
      const drawingData = {
        title: drawingTitle,
        description: questContext 
          ? `Quest drawing: ${questContext.questTitle}` 
          : storyContext
          ? `Story illustration: ${storyContext.story.title}`
          : `Drawing created by ${user.username}`,
        canvas_data: canvasData,
        time_lapse: timeLapse,
        quest_id: questContext?.questId || null
      };
      
      const savedDrawing = await drawingService.createDrawing(drawingData);
      
      // Get AI feedback on the completed drawing
      if (aiInitialized) {
        try {
          const feedback = await aiAssistance.analyzeCompletedDrawing(canvasData, timeLapse);
          showDrawingFeedback(feedback);
        } catch (error) {
          console.error('AI feedback failed:', error);
        }
      }
      
      alert('🎨 Drawing saved successfully!');
      navigate('/gallery');
    } catch (error) {
      console.error('Error saving drawing:', error);
      alert('Failed to save drawing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showDrawingFeedback = (feedback) => {
    let message = `🎉 Drawing Complete!\n\nScore: ${feedback.score}/100\n\n`;
    
    if (feedback.strengths.length > 0) {
      message += `Strengths:\n${feedback.strengths.join('\n')}\n\n`;
    }
    
    if (feedback.achievements.length > 0) {
      message += `Achievements:\n${feedback.achievements.join('\n')}\n\n`;
    }
    
    if (feedback.suggestions.length > 0) {
      message += `Suggestions for next time:\n${feedback.suggestions.join('\n')}`;
    }
    
    alert(message);
  };

  const toggleAiAssistant = () => {
    setShowAiAssistant(!showAiAssistant);
    if (!showAiAssistant && aiHints.length === 0 && questContext) {
      loadQuestHints(questContext.questId);
    }
  };

  const AIAssistantPanel = () => (
    <div className={`fixed right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-72 transition-transform duration-300 z-20 ${
      showAiAssistant ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-draw-primary">🤖 AI Assistant</h3>
        <button
          onClick={toggleAiAssistant}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {/* Story Context */}
      {storyContext && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📚 Current Story</h4>
          <p className="text-sm text-blue-700">{storyContext.story.title}</p>
          {storyContext.story.pages && storyContext.story.pages[0] && (
            <p className="text-xs text-blue-600 mt-2">
              {storyContext.story.pages[0].drawing_prompt}
            </p>
          )}
        </div>
      )}
      
      {/* AI Hints */}
      {aiHints.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Smart Tips</h4>
          <div className="space-y-2">
            {aiHints.map((hint, index) => (
              <div key={index} className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                {hint}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Progress Stats */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">📊 Progress</h4>
        <div className="space-y-1 text-sm">
          <div>Steps: <span className="font-medium">{timeLapse.length}</span></div>
          <div>Current Tool: <span className="font-medium">{tool}</span></div>
          <div>AI Status: <span className="font-medium text-green-600">
            {aiInitialized ? 'Active' : 'Offline'}
          </span></div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={async () => {
            const hints = await aiAssistance.getPersonalizedHints(questContext?.questId);
            setAiHints(hints.hints || []);
          }}
          className="w-full btn-child btn-primary text-sm py-2"
        >
          🔄 Refresh Tips
        </button>
        
        {questContext && (
          <button
            onClick={() => navigate('/quests')}
            className="w-full btn-child btn-secondary text-sm py-2"
          >
            🗺️ Back to Quests
          </button>
        )}
      </div>
    </div>
  );

  const tools = [
    { name: 'pencil', icon: '✏️', label: 'Pencil' },
    { name: 'marker', icon: '🖍️', label: 'Marker' },
    { name: 'rainbow', icon: '🌈', label: 'Rainbow Brush' },
    { name: 'bucket', icon: '🪣', label: 'Paint Bucket' },
    { name: 'eraser', icon: '🧹', label: 'Eraser' }
  ];

  const predefinedColors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080',
    '#FFFFFF', '#8B4513', '#FFD700', '#32CD32'
  ];

  return (
    <div className="drawing-interface">
      {/* Enhanced Toolbar */}
      <div className="drawing-toolbar">
        <div className="space-y-2 h-full overflow-y-auto">
          {/* Tools */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 px-2">Tools</div>
            {tools.map((t) => (
              <button
                key={t.name}
                onClick={() => setTool(t.name)}
                className={`drawing-tool ${tool === t.name ? 'active' : ''}`}
                title={t.label}
              >
                <span className="text-xl">{t.icon}</span>
              </button>
            ))}
          </div>
          
          {/* Brush Size */}
          <div className="px-2">
            <div className="text-xs text-gray-500 mb-2">Size</div>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
              title="Brush Size"
            />
            <div className="text-xs text-center mt-1">{brushSize}px</div>
          </div>
          
          {/* Color Section */}
          <div className="px-1">
            <div className="text-xs text-gray-500 mb-2 px-1">Colors</div>
            
            {/* Current Color Display */}
            <div className="mb-2 px-1">
              <div 
                className="w-full h-6 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: tool === 'rainbow' ? `hsl(${rainbowHue}, 80%, 60%)` : color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Current Color"
              />
            </div>
            
            {/* Color Picker */}
            {showColorPicker && (
              <div className="mb-2 px-1">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setColor(e.target.value);
                  }}
                  className="w-full h-6"
                />
              </div>
            )}
            
            {/* Predefined Colors */}
            <div className="grid grid-cols-2 gap-1">
              {predefinedColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border-2 ${color === c ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-2 px-2">
            <div className="text-xs text-gray-500">Actions</div>
            <button
              onClick={undo}
              disabled={currentStep === 0}
              className="drawing-tool w-full disabled:opacity-50"
              title="Undo"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={currentStep === drawingHistory.length - 1}
              className="drawing-tool w-full disabled:opacity-50"
              title="Redo"
            >
              ↷
            </button>
            <button
              onClick={clearCanvas}
              className="drawing-tool w-full text-red-500"
              title="Clear Canvas"
            >
              🗑️
            </button>
            <button
              onClick={exportCanvas}
              className="drawing-tool w-full text-blue-500"
              title="Export Drawing"
            >
              💾
            </button>
            {timeLapse.length > 0 && (
              <button
                onClick={playTimeLapse}
                disabled={isPlaying}
                className="drawing-tool w-full text-green-500"
                title="Play Time-lapse"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            )}
            
            {/* AI Assistant Toggle */}
            {aiInitialized && (
              <button
                onClick={toggleAiAssistant}
                className={`drawing-tool w-full ${showAiAssistant ? 'bg-blue-100 border-blue-500' : 'text-purple-500'}`}
                title="AI Assistant"
              >
                🤖
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="drawing-canvas-area">
        {/* Enhanced Header */}
        <div className="drawing-canvas-header">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-child btn-secondary text-sm px-4 py-2"
            >
              ← Back to Dashboard
            </button>
            <input
              type="text"
              placeholder={questContext ? `Quest: ${questContext.questTitle}` : 
                           storyContext ? `Story: ${storyContext.story.title}` :
                           "Enter drawing title..."}
              value={drawingTitle}
              onChange={(e) => setDrawingTitle(e.target.value)}
              className="input-field flex-1 max-w-md"
            />
            {questContext && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                🎯 Quest Mode
              </div>
            )}
            {storyContext && (
              <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                📚 Story Mode
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Tool: <span className="font-semibold">{tool}</span> | 
              Size: <span className="font-semibold">{brushSize}px</span> |
              Steps: <span className="font-semibold">{timeLapse.length}</span>
              {aiInitialized && (
                <span className="ml-2 text-green-600">🤖 AI Active</span>
              )}
            </div>
            <button
              onClick={saveDrawing}
              disabled={isLoading}
              className="btn-child btn-primary text-sm px-4 py-2"
            >
              {isLoading ? 'Saving...' : '💾 Save Drawing'}
            </button>
          </div>
        </div>

        {/* Enhanced Canvas */}
        <div className="drawing-canvas-main">
          <div className="canvas-container relative">
            {/* Rainbow mode indicator */}
            {tool === 'rainbow' && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                🌈 Rainbow Mode Active
              </div>
            )}
            
            {/* Time-lapse indicator */}
            {isPlaying && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                ▶️ Playing Time-lapse
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              width={1000}
              height={700}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                const event = {
                  nativeEvent: {
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top
                  }
                };
                startDrawing(event);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                const event = {
                  nativeEvent: {
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top
                  }
                };
                draw(event);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel />
    </div>
  );
};

export default DrawingCanvas;