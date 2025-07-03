import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paper from 'paper';
import { drawingService } from '../services/drawingService';

const DrawingCanvas = ({ user }) => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLapse, setTimeLapse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState('');

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize Paper.js
      paper.setup(canvasRef.current);
      
      // Set up initial drawing state
      const initialState = paper.project.exportJSON();
      setDrawingHistory([initialState]);
      setCurrentStep(0);
      
      // Clean up on unmount
      return () => {
        if (paper.project) {
          paper.project.clear();
        }
      };
    }
  }, []);

  const startDrawing = (event) => {
    if (!paper.project) return;
    
    setIsDrawing(true);
    const point = new paper.Point(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    
    // Record time-lapse step
    const timeStep = {
      timestamp: Date.now(),
      action: 'start',
      tool: tool,
      color: color,
      size: brushSize,
      point: { x: point.x, y: point.y }
    };
    setTimeLapse(prev => [...prev, timeStep]);
    
    // Create new path based on selected tool
    if (tool === 'pencil' || tool === 'marker') {
      const path = new paper.Path();
      path.strokeColor = color;
      path.strokeWidth = brushSize;
      path.strokeCap = 'round';
      path.strokeJoin = 'round';
      
      if (tool === 'marker') {
        path.opacity = 0.7;
      }
      
      path.add(point);
      window.currentPath = path;
    } else if (tool === 'eraser') {
      // Eraser functionality - remove intersecting paths
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
  };

  const draw = (event) => {
    if (!isDrawing || !paper.project) return;
    
    const point = new paper.Point(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    
    if (tool === 'pencil' || tool === 'marker') {
      if (window.currentPath) {
        window.currentPath.add(point);
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
        width: canvasRef.current.width,
        height: canvasRef.current.height
      };
      
      const drawingData = {
        title: drawingTitle,
        description: `Drawing created by ${user.username}`,
        canvas_data: canvasData,
        time_lapse: timeLapse
      };
      
      await drawingService.createDrawing(drawingData);
      alert('Drawing saved successfully!');
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
    { name: 'eraser', icon: '🧹', label: 'Eraser' },
    { name: 'rainbow', icon: '🌈', label: 'Rainbow Brush' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  return (
    <div className="drawing-interface">
      {/* Toolbar */}
      <div className="drawing-toolbar">
        <div className="space-y-4">
          {/* Tools */}
          {tools.map((t) => (
            <button
              key={t.name}
              onClick={() => setTool(t.name)}
              className={`drawing-tool ${tool === t.name ? 'active' : ''}`}
              title={t.label}
            >
              <span className="text-2xl">{t.icon}</span>
            </button>
          ))}
          
          {/* Brush Size */}
          <div className="px-2">
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
              title="Brush Size"
            />
            <div className="text-xs text-center mt-1">{brushSize}px</div>
          </div>
          
          {/* Colors */}
          <div className="grid grid-cols-2 gap-1 px-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded border-2 ${color === c ? 'border-gray-800' : 'border-gray-300'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
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
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="drawing-canvas-area">
        {/* Header */}
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
              placeholder="Enter drawing title..."
              value={drawingTitle}
              onChange={(e) => setDrawingTitle(e.target.value)}
              className="input-field flex-1 max-w-md"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Tool: {tool} | Size: {brushSize}px
            </span>
            <button
              onClick={saveDrawing}
              disabled={isLoading}
              className="btn-child btn-primary text-sm px-4 py-2"
            >
              {isLoading ? 'Saving...' : 'Save Drawing'}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="drawing-canvas-main">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;