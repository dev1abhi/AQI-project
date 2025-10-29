import React from 'react';

function LoadingSpinner() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 mb-4">
          <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-teal-400 mb-2">Analyzing Air Quality Data</h3>
        <div className="space-y-2 text-gray-400">
          <p>🔍 Processing dataset and detecting parameters...</p>
          <p>📊 Training forecasting models...</p>
          <p>🎨 Applying atmospheric effects...</p>
          <p>📈 Generating visualizations...</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;