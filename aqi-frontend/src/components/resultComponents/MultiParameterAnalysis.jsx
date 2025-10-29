import React from 'react';

function MultiParameterAnalysis({ data, breakdown, primary }) {
  if (!data && !breakdown) {
    return (
      <div className="bg-gray-700/30 p-6 rounded-lg">
        <h4 className="font-medium text-gray-300 mb-4">Multi-Parameter Analysis</h4>
        <p className="text-gray-400">Only PM2.5 data available in the dataset.</p>
      </div>
    );
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-green-400 bg-green-900/20';
    if (aqi <= 100) return 'text-yellow-400 bg-yellow-900/20';
    if (aqi <= 150) return 'text-orange-400 bg-orange-900/20';
    if (aqi <= 200) return 'text-red-400 bg-red-900/20';
    if (aqi <= 300) return 'text-purple-400 bg-purple-900/20';
    return 'text-red-600 bg-red-900/40';
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-300">Multi-Parameter Analysis</h4>
      
      {primary && (
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-6">
          <h5 className="font-semibold text-red-400 mb-2">Primary Pollutant</h5>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-red-300">
              {primary.pollutant?.toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-semibold text-white">AQI: {primary.aqi_value}</div>
              <div className="text-sm text-gray-400">Highest contributing pollutant</div>
            </div>
          </div>
        </div>
      )}

      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h5 className="font-medium text-gray-300 mb-4">AQI Breakdown by Pollutant</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(breakdown).map(([pollutant, aqi]) => (
              <div key={pollutant} className={`p-4 rounded-lg ${getAQIColor(aqi)}`}>
                <div className="text-2xl font-bold">{aqi}</div>
                <div className="text-sm uppercase">{pollutant}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && Object.keys(data).length > 0 && (
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h5 className="font-medium text-gray-300 mb-4">Pollutant Concentrations</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 text-teal-400">Pollutant</th>
                  <th className="text-left py-2 text-teal-400">Latest Value</th>
                  <th className="text-left py-2 text-teal-400">30-Day Average</th>
                  <th className="text-left py-2 text-teal-400">Unit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([pollutant, info]) => (
                  <tr key={pollutant} className="border-b border-gray-700">
                    <td className="py-2 text-white font-medium uppercase">{pollutant}</td>
                    <td className="py-2 text-gray-300">{info.latest_value?.toFixed(1)}</td>
                    <td className="py-2 text-gray-300">{info.average_30_days?.toFixed(1)}</td>
                    <td className="py-2 text-gray-400">{info.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiParameterAnalysis;