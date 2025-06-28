import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const ApiModeToggle = () => {
  const [currentMode, setCurrentMode] = useState(apiService.getCurrentMode());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toggle in development mode
    setIsVisible(import.meta.env.DEV);
  }, []);

  const handleToggle = () => {
    apiService.toggleMockMode();
  };

  const handleKeyPress = (e) => {
    // Toggle with Ctrl+Shift+M
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      handleToggle();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">API Mode:</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              currentMode === 'mock' 
                ? 'bg-yellow-500 text-yellow-900' 
                : 'bg-green-500 text-green-900'
            }`}>
              {currentMode.toUpperCase()}
            </span>
          </div>
          <button
            onClick={handleToggle}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            title="Toggle between Mock and Real API (Ctrl+Shift+M)"
          >
            Toggle
          </button>
        </div>
        <div className="text-xs text-gray-300 mt-1">
          Press Ctrl+Shift+M to toggle
        </div>
      </div>
    </div>
  );
};

export default ApiModeToggle; 