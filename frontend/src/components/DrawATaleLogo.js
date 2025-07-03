import React from 'react';

const DrawATaleLogo = ({ 
  width = 200, 
  height = 'auto', 
  className = '', 
  showTagline = true,
  variant = 'full' // 'full', 'icon-only', 'text-only'
}) => {
  // For now, we'll use a placeholder that matches the uploaded logo design
  // In production, you would use the actual logo image file
  
  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center ${className}`} style={{ width, height }}>
        <div className="relative">
          {/* Paintbrush Icon */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="25%" stopColor="#ffd93d" />
                <stop offset="50%" stopColor="#6bcf7f" />
                <stop offset="75%" stopColor="#4d9de0" />
                <stop offset="100%" stopColor="#9b59b6" />
              </linearGradient>
            </defs>
            
            {/* Brush handle */}
            <rect x="20" y="60" width="8" height="30" fill="#8b4513" rx="2" />
            
            {/* Brush ferrule */}
            <rect x="18" y="50" width="12" height="12" fill="#c0c0c0" rx="1" />
            
            {/* Brush bristles with colorful paint */}
            <path d="M15 50 Q25 40 35 50 Q25 30 15 50" fill="url(#brushGradient)" opacity="0.8" />
            
            {/* Paint drips */}
            <circle cx="40" cy="45" r="3" fill="#ff6b6b" opacity="0.7" />
            <circle cx="50" cy="55" r="2" fill="#4d9de0" opacity="0.7" />
            <circle cx="35" cy="65" r="2.5" fill="#ffd93d" opacity="0.7" />
            
            {/* Sparkle effects */}
            <circle cx="60" cy="30" r="1.5" fill="#fff" opacity="0.9" />
            <circle cx="70" cy="40" r="1" fill="#fff" opacity="0.9" />
            <circle cx="55" cy="25" r="1" fill="#fff" opacity="0.9" />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={`flex flex-col items-center ${className}`} style={{ width, height }}>
        <div className="text-draw-primary font-bold text-2xl tracking-wide">
          DRAW-a-TALE
        </div>
        {showTagline && (
          <div className="text-gray-600 text-sm mt-1">
            Begin your Artist's Journey
          </div>
        )}
      </div>
    );
  }

  // Full logo (default)
  return (
    <div className={`flex items-center space-x-3 ${className}`} style={{ width, height }}>
      {/* Icon part */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="25%" stopColor="#ffd93d" />
              <stop offset="50%" stopColor="#6bcf7f" />
              <stop offset="75%" stopColor="#4d9de0" />
              <stop offset="100%" stopColor="#9b59b6" />
            </linearGradient>
          </defs>
          
          {/* Brush handle */}
          <rect x="35" y="60" width="8" height="30" fill="#8b4513" rx="2" />
          
          {/* Brush ferrule */}
          <rect x="33" y="50" width="12" height="12" fill="#c0c0c0" rx="1" />
          
          {/* Brush bristles with colorful paint */}
          <path d="M30 50 Q40 35 50 50 Q40 25 30 50" fill="url(#brushGradient)" opacity="0.9" />
          
          {/* Paint drips */}
          <circle cx="55" cy="40" r="3" fill="#ff6b6b" opacity="0.8" />
          <circle cx="25" cy="45" r="2" fill="#4d9de0" opacity="0.8" />
          <circle cx="45" cy="30" r="2.5" fill="#ffd93d" opacity="0.8" />
          
          {/* Sparkle effects */}
          <circle cx="65" cy="25" r="1.5" fill="#fff" opacity="0.9" />
          <circle cx="20" cy="35" r="1" fill="#fff" opacity="0.9" />
          <circle cx="60" cy="15" r="1" fill="#fff" opacity="0.9" />
        </svg>
      </div>
      
      {/* Text part */}
      <div className="flex flex-col">
        <div className="text-draw-primary font-bold text-xl lg:text-2xl tracking-wide leading-tight">
          DRAW-a-TALE
        </div>
        {showTagline && (
          <div className="text-gray-600 text-xs lg:text-sm -mt-1">
            Begin your Artist's Journey
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawATaleLogo;