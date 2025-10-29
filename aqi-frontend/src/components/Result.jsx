// components/Result.js
import React, { useState } from "react";
import CurrentConditions from "./resultComponents/currentConditions";
import ForecastTable from "./resultComponents/ForecastTable";
import Statistics from "./resultComponents/Statistics";
import HealthRecommendations from "./resultComponents/HealthRecommendations";
import Visualizations from "./resultComponents/Visualizations";
import ProcessedImages from "./resultComponents/ProcessedImages";
import MultiParameterAnalysis from "./resultComponents/MultiParameterAnalysis";

function Result({ result }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.ai_generation?.prompt || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: "📊" },
    { id: "forecast", label: "🔮 Forecast", icon: "🔮" },
    { id: "health", label: "🏥 Health", icon: "🏥" },
    { id: "analysis", label: "🔬 Analysis", icon: "🔬" },
    { id: "visuals", label: "📈 Charts", icon: "📈" }
  ];

  if (!result || result.status !== "success") {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Analysis Failed</h3>
        <p className="text-red-300">Unable to process the data. Please check your files and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Air Quality Analysis Results
          </h2>
          <div className="text-right text-sm text-gray-400">
            <p>Analysis completed</p>
            <p>{new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-teal-400">
              {result.summary?.overall_aqi?.toFixed(0) || "N/A"}
            </div>
            <div className="text-sm text-gray-400">Overall AQI</div>
            <div className="text-xs text-gray-500">{result.summary?.overall_category}</div>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {result.current_conditions?.predicted_tomorrow?.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Tomorrow's PM2.5</div>
            <div className="text-xs text-gray-500">{result.current_conditions?.category}</div>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {result.data_summary?.parameters_analyzed || 1}
            </div>
            <div className="text-sm text-gray-400">Parameters Analyzed</div>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">
              {result.statistics?.total_records || 0}
            </div>
            <div className="text-sm text-gray-400">Data Points</div>
            <div className="text-xs text-gray-500">
              {result.statistics?.recent_30_days?.trend_direction}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.icon}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <CurrentConditions data={result.current_conditions} />
              <Statistics data={result.statistics} />
            </div>
          )}

          {activeTab === "forecast" && (
            <ForecastTable predictions={result.predictions} />
          )}

          {activeTab === "health" && (
            <HealthRecommendations 
              recommendations={result.health_recommendations}
              aqi={result.current_conditions?.predicted_tomorrow}
            />
          )}

          {activeTab === "analysis" && (
            <div className="space-y-6">
              <MultiParameterAnalysis 
                data={result.multi_parameter_analysis}
                breakdown={result.aqi_breakdown}
                primary={result.primary_pollutant}
              />
              <ProcessedImages images={result.processed_images} />
            </div>
          )}

          {activeTab === "visuals" && (
            <Visualizations data={result.visualizations} />
          )}
        </div>
      </div>

      {/* AI Generation Section */}
      {result.ai_generation?.gemini_url && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">🤖 AI-Generated Visualization</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={result.ai_generation.gemini_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <span>🎨 Generate AI Visualization</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            {result.ai_generation.prompt && (
              <button
                onClick={handleCopy}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200"
                title="Copy prompt"
              >
                {copied ? "✅ Copied!" : "📋 Copy Prompt"}
              </button>
            )}
          </div>

          {result.ai_generation.prompt && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300 font-mono leading-relaxed">
                {result.ai_generation.prompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Result;