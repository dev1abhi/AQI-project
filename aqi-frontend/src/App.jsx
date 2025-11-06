import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import Result from "./components/Result";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-3">
          Smart AQI Metrics with Smog Visualization
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Advanced air quality forecasting with multi-parameter analysis, health recommendations, and AI-powered visualizations
        </p>
      </div>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          <UploadForm 
            setResult={setResult} 
            setLoading={setLoading} 
            setError={setError}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">Analysis Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="max-w-7xl mx-auto">
          <Result result={result} />
        </div>
      )}
    </div>
  );
}

export default App;