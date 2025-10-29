import React from 'react';

function Visualizations({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-200">Data Visualizations</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.forecast_plot && (
          <div className="bg-gray-700/30 p-6 rounded-lg">
            <h4 className="font-medium text-gray-300 mb-4">Forecast Analysis</h4>
            <div className="bg-white rounded-lg p-2">
              <img 
                src={`data:image/png;base64,${data.forecast_plot}`}
                alt="Forecast Analysis Chart"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {data.aqi_gauge && (
          <div className="bg-gray-700/30 p-6 rounded-lg">
            <h4 className="font-medium text-gray-300 mb-4">AQI Gauge</h4>
            <div className="bg-white rounded-lg p-2">
              <img 
                src={`data:image/png;base64,${data.aqi_gauge}`}
                alt="AQI Gauge"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Visualizations;