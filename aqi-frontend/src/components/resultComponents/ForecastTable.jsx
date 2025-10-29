// components/ForecastTable.js
import React, { useState } from 'react';

function ForecastTable({ predictions }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  if (!predictions || predictions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No forecast data available
      </div>
    );
  }

  const getAQIColor = (category) => {
    const colors = {
      'Good': 'bg-green-500',
      'Moderate': 'bg-yellow-500',
      'Unhealthy for Sensitive Groups': 'bg-orange-500',
      'Unhealthy': 'bg-red-500',
      'Very Unhealthy': 'bg-purple-500',
      'Hazardous': 'bg-red-700'
    };
    return colors[category] || 'bg-gray-500';
  };

  const maxAQI = Math.max(...predictions.map(p => p.predicted_aqi));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-200">30-Day Forecast</h3>
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'table' ? 'bg-teal-600 text-white' : 'text-gray-400'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'chart' ? 'bg-teal-600 text-white' : 'text-gray-400'
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 rounded-lg">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-teal-400 font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-teal-400 font-semibold">Predicted AQI</th>
                <th className="px-4 py-3 text-left text-teal-400 font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-teal-400 font-semibold">Confidence Range</th>
                <th className="px-4 py-3 text-left text-teal-400 font-semibold">Haze Level</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-300">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white">{p.predicted_aqi?.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getAQIColor(p.category)}`}></span>
                    <span className="text-gray-300">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {p.confidence_lower?.toFixed(1)} - {p.confidence_upper?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{width: `${(p.haze_intensity / 200) * 100}%`}}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-sm">{p.haze_intensity}/200</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <div className="space-y-2">
            {predictions.map((p, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 w-20">
                  {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 bg-gray-600 rounded-full h-6 relative">
                  <div 
                    className={`h-6 rounded-full ${getAQIColor(p.category)} transition-all duration-500`}
                    style={{width: `${(p.predicted_aqi / maxAQI) * 100}%`}}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {p.predicted_aqi?.toFixed(0)}
                  </span>
                </div>
                <div className="text-sm text-gray-400 w-24">{p.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ForecastTable;