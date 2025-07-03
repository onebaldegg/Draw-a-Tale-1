import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;