// components/CurrentConditions.js
import React from 'react';

function CurrentConditions({ data }) {
  if (!data) return null;

  const getAQIColor = (category) => {
    const colors = {
      'Good': 'text-green-400 bg-green-900/20',
      'Moderate': 'text-yellow-400 bg-yellow-900/20',
      'Unhealthy for Sensitive Groups': 'text-orange-400 bg-orange-900/20',
      'Unhealthy': 'text-red-400 bg-red-900/20',
      'Very Unhealthy': 'text-purple-400 bg-purple-900/20',
      'Hazardous': 'text-red-600 bg-red-900/40'
    };
    return colors[category] || 'text-gray-400 bg-gray-900/20';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-200 mb-4">Current Air Quality Conditions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-3">Latest Measurements</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Current PM2.5:</span>
              <span className="text-white font-semibold">{data.latest_pm25?.toFixed(1)} μg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Predicted Tomorrow:</span>
              <span className="text-teal-400 font-semibold">{data.predicted_tomorrow?.toFixed(1)} μg/m³</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-3">Air Quality Category</h4>
          <div className={`inline-block px-3 py-2 rounded-lg font-semibold ${getAQIColor(data.category)}`}>
            {data.category}
          </div>
        </div>
      </div>

      {data.pollutant_levels && Object.keys(data.pollutant_levels).length > 1 && (
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-3">All Pollutant Levels</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(data.pollutant_levels).map(([pollutant, value]) => (
              <div key={pollutant} className="text-center">
                <div className="text-2xl font-bold text-teal-400">{value?.toFixed(1)}</div>
                <div className="text-xs text-gray-400 uppercase">{pollutant}</div>
                <div className="text-xs text-gray-500">μg/m³</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentConditions;