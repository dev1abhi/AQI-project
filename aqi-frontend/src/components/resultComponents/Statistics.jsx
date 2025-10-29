// components/Statistics.js
import React from 'react';

function Statistics({ data }) {
  if (!data) return null;

  const getTrendIcon = (direction) => {
    switch(direction) {
      case 'Improving': return '↗';
      case 'Worsening': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = (direction) => {
    switch(direction) {
      case 'Improving': return 'text-green-400';
      case 'Worsening': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-200">Dataset Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-4">Dataset Overview</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Records:</span>
              <span className="text-white font-semibold">{data.total_records?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date Range:</span>
              <span className="text-white font-semibold">
                {data.date_range?.start} to {data.date_range?.end}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 p-6 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-4">Recent Trend (30 Days)</h4>
          <div className="flex items-center space-x-3 mb-3">
            <span className={`text-2xl ${getTrendColor(data.recent_30_days?.trend_direction)}`}>
              {getTrendIcon(data.recent_30_days?.trend_direction)}
            </span>
            <div>
              <div className={`font-semibold ${getTrendColor(data.recent_30_days?.trend_direction)}`}>
                {data.recent_30_days?.trend_direction}
              </div>
              <div className="text-sm text-gray-400">
                Slope: {data.recent_30_days?.trend_slope?.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-700/30 p-6 rounded-lg">
        <h4 className="font-medium text-gray-300 mb-4">30-Day Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {data.recent_30_days?.average?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Average</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {data.recent_30_days?.median?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Median</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {data.recent_30_days?.maximum?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Maximum</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-400">
              {data.recent_30_days?.minimum?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Minimum</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {data.recent_30_days?.std_dev?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Std Dev</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-700/30 p-6 rounded-lg">
        <h4 className="font-medium text-gray-300 mb-4">Air Quality Days</h4>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {30 - (data.recent_30_days?.days_above_safe || 0)}
            </div>
            <div className="text-sm text-gray-400">Safe Days</div>
            <div className="text-xs text-gray-500">(≤50 μg/m³)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">
              {data.recent_30_days?.days_above_safe || 0}
            </div>
            <div className="text-sm text-gray-400">Unhealthy Days</div>
            <div className="text-xs text-gray-500">(&gt;50 μg/m³)</div>
          </div>
        </div>
        <div className="mt-4 bg-gray-600 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
            style={{width: `${((data.recent_30_days?.days_above_safe || 0) / 30) * 100}%`}}
          ></div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          {(((data.recent_30_days?.days_above_safe || 0) / 30) * 100).toFixed(1)}% unhealthy days
        </div>
      </div>
    </div>
  );
}

export default Statistics;