import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paper from 'paper';
import { drawingService } from '../services/drawingService';

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

  useEffect(() => {
    // Check if we're coming from a quest
    if (location.state && location.state.questId) {
      setQuestContext(location.state);
      setDrawingTitle(`Quest: ${location.state.questTitle}`);
    }
  }, [location.state]);

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
    setTimeLapse(prev => [...prev, timeStep]);
    
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
    setTimeLapse(prev => [...prev, timeStep]);
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
          : `Drawing created by ${user.username}`,
        canvas_data: canvasData,
        time_lapse: timeLapse,
        quest_id: questContext?.questId || null
      };
      
      await drawingService.createDrawing(drawingData);
      alert('🎨 Drawing saved successfully!');
      navigate('/gallery');
    } catch (error) {
      console.error('Error saving drawing:', error);
      alert('Failed to save drawing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="space-y-4 h-full overflow-y-auto">
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
                className="w-full h-8 rounded border-2 border-gray-300 cursor-pointer"
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
                  className="w-full h-8"
                />
              </div>
            )}
            
            {/* Predefined Colors */}
            <div className="grid grid-cols-2 gap-1">
              {predefinedColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded border-2 ${color === c ? 'border-gray-800' : 'border-gray-300'}`}
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
              placeholder={questContext ? `Quest: ${questContext.questTitle}` : "Enter drawing title..."}
              value={drawingTitle}
              onChange={(e) => setDrawingTitle(e.target.value)}
              className="input-field flex-1 max-w-md"
            />
            {questContext && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                🎯 Quest Mode
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Tool: <span className="font-semibold">{tool}</span> | 
              Size: <span className="font-semibold">{brushSize}px</span> |
              Steps: <span className="font-semibold">{timeLapse.length}</span>
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
    </div>
  );
};

export default DrawingCanvas;