import React from 'react';

function HealthRecommendations({ recommendations, aqi }) {
  if (!recommendations) return null;

  const getRiskColor = (level) => {
    const colors = {
      'LOW': 'text-green-400 bg-green-900/20 border-green-500/50',
      'MODERATE': 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50',
      'HIGH': 'text-red-400 bg-red-900/20 border-red-500/50',
      'EMERGENCY': 'text-red-600 bg-red-900/40 border-red-600/70'
    };
    return colors[level] || 'text-gray-400 bg-gray-900/20 border-gray-500/50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-200">Health Recommendations</h3>
        <div className={`px-4 py-2 rounded-lg border font-semibold ${getRiskColor(recommendations.risk_level)}`}>
          Risk Level: {recommendations.risk_level}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-3 flex items-center">
            <span className="mr-2">👥</span>
            General Population
          </h4>
          <p className="text-gray-300 leading-relaxed">{recommendations.general}</p>
        </div>

        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-orange-400 mb-3 flex items-center">
            <span className="mr-2">⚠</span>
            Sensitive Groups
          </h4>
          <p className="text-gray-300 leading-relaxed">{recommendations.sensitive}</p>
          <div className="mt-2 text-sm text-gray-400">
            Includes: Children, elderly, people with heart/lung conditions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-green-400 mb-3 flex items-center">
            <span className="mr-2">🏃</span>
            Outdoor Activities
          </h4>
          <p className="text-gray-300 leading-relaxed">{recommendations.activities}</p>
        </div>

        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-purple-400 mb-3 flex items-center">
            <span className="mr-2">🛡</span>
            Precautionary Measures
          </h4>
          <p className="text-gray-300 leading-relaxed">{recommendations.precautions}</p>
        </div>
      </div>

      {aqi > 150 && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h4 className="font-semibold text-red-400 mb-3 flex items-center">
            <span className="mr-2">🚨</span>
            Health Alert
          </h4>
          <div className="space-y-2 text-red-300">
            <p>Air quality has reached unhealthy levels. Consider the following actions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Stay indoors as much as possible</li>
              <li>Use air purifiers if available</li>
              <li>Wear N95 masks when going outside</li>
              <li>Avoid outdoor exercise and strenuous activities</li>
              <li>Keep windows and doors closed</li>
              {aqi > 300 && <li className="font-semibold">Seek medical attention if you experience breathing difficulties</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthRecommendations;
