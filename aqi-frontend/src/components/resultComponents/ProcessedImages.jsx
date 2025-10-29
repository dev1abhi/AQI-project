import React, { useState } from 'react';

function ProcessedImages({ images }) {
  const [activeImage, setActiveImage] = useState('original');
  
  if (!images || (!images.original && !images.with_smog)) {
    return (
      <div className="bg-gray-700/30 p-6 rounded-lg">
        <h4 className="font-medium text-gray-300 mb-4">Image Processing</h4>
        <p className="text-gray-400">No reference image was provided for smog effect simulation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-300">Smog Effect Simulation</h4>
        <div className="text-sm text-gray-400">
          Haze Intensity: {images.haze_intensity}/200
        </div>
      </div>

      <div className="flex bg-gray-700 rounded-lg p-1">
        {images.original && (
          <button
            onClick={() => setActiveImage('original')}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              activeImage === 'original' ? 'bg-teal-600 text-white' : 'text-gray-400'
            }`}
          >
            Original
          </button>
        )}
        {images.with_smog && (
          <button
            onClick={() => setActiveImage('with_smog')}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              activeImage === 'with_smog' ? 'bg-teal-600 text-white' : 'text-gray-400'
            }`}
          >
            With Smog Effect
          </button>
        )}
      </div>

      <div className="bg-gray-700/30 p-4 rounded-lg">
        {activeImage === 'original' && images.original && (
          <img 
            src={`data:image/jpeg;base64,${images.original}`}
            alt="Original Image"
            className="w-full h-auto rounded-lg"
          />
        )}
        {activeImage === 'with_smog' && images.with_smog && (
          <img 
            src={`data:image/jpeg;base64,${images.with_smog}`}
            alt="Image with Smog Effect"
            className="w-full h-auto rounded-lg"
          />
        )}
      </div>

      {images.haze_intensity > 0 && (
        <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
          <p className="text-orange-300 text-sm">
            <strong>Smog Effect Applied:</strong> Based on the predicted AQI level, atmospheric effects including 
            haze, reduced visibility, and color tinting have been applied to simulate real-world air pollution impact.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProcessedImages;
