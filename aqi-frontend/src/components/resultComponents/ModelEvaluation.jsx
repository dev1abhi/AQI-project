import React from "react";

function ModelEvaluation({ metrics }) {
  if (!metrics) {
    return (
      <div className="bg-gray-700/30 p-6 rounded-lg">
        <p className="text-gray-400">Model evaluation metrics not available</p>
      </div>
    );
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return "text-green-400";
    if (accuracy >= 75) return "text-blue-400";
    if (accuracy >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return "text-green-400";
    if (score >= 0.7) return "text-blue-400";
    if (score >= 0.5) return "text-yellow-400";
    return "text-orange-400";
  };

  const metricsData = [
    {
      name: "Model Accuracy",
      value: metrics.accuracy_percentage?.toFixed(2) || "N/A",
      unit: "%",
      description: "Overall prediction accuracy",
      color: getAccuracyColor(metrics.accuracy_percentage),
      icon: "🎯",
      info: "Higher is better. Shows how accurate the model predictions are."
    },
    {
      name: "R² Score",
      value: metrics.r2_score?.toFixed(4) || "N/A",
      unit: "",
      description: "Coefficient of determination",
      color: getScoreColor(metrics.r2_score),
      icon: "📊",
      info: "Range: 0-1. Measures how well the model explains variance in data."
    },
    {
      name: "MAE",
      value: metrics.mae?.toFixed(2) || "N/A",
      unit: "μg/m³",
      description: "Mean Absolute Error",
      color: "text-purple-400",
      icon: "📏",
      info: "Lower is better. Average magnitude of errors in predictions."
    },
    {
      name: "MSE",
      value: metrics.mse?.toFixed(2) || "N/A",
      unit: "μg/m³²",
      description: "Mean Squared Error",
      color: "text-indigo-400",
      icon: "📐",
      info: "Lower is better. Penalizes larger errors more heavily than MAE."
    },
    {
      name: "RMSE",
      value: metrics.rmse?.toFixed(2) || "N/A",
      unit: "μg/m³",
      description: "Root Mean Squared Error",
      color: "text-pink-400",
      icon: "📊",
      info: "Lower is better. Standard deviation of prediction errors."
    },
    {
      name: "MAPE",
      value: metrics.mape?.toFixed(2) || "N/A",
      unit: "%",
      description: "Mean Absolute Percentage Error",
      color: "text-cyan-400",
      icon: "📈",
      info: "Lower is better. Average percentage difference from actual values."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-500/20">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
          🤖 Model Performance Evaluation
        </h3>
        <p className="text-gray-400">
          Statistical metrics measuring the accuracy and reliability of the Prophet forecasting model
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{metric.icon}</div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${metric.color}`}>
                  {metric.value}
                  {metric.value !== "N/A" && (
                    <span className="text-lg ml-1 text-gray-400">{metric.unit}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-semibold text-gray-200">{metric.name}</h4>
              <p className="text-sm text-gray-400">{metric.description}</p>
              <p className="text-xs text-gray-500 mt-2 italic">{metric.info}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Interpretation */}
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
        <h4 className="text-xl font-semibold text-gray-200 mb-4">📋 Performance Interpretation</h4>
        
        <div className="space-y-4">
          {/* Accuracy Level */}
          <div className="flex items-start space-x-3">
            <div className="text-2xl">
              {metrics.accuracy_percentage >= 90 ? "🟢" :
               metrics.accuracy_percentage >= 75 ? "🔵" :
               metrics.accuracy_percentage >= 60 ? "🟡" : "🟠"}
            </div>
            <div>
              <h5 className="font-semibold text-gray-300">Accuracy Level</h5>
              <p className="text-sm text-gray-400">
                {metrics.accuracy_percentage >= 90 ? "Excellent - Highly reliable predictions" :
                 metrics.accuracy_percentage >= 75 ? "Good - Reliable for most applications" :
                 metrics.accuracy_percentage >= 60 ? "Fair - Acceptable with caution" :
                 "Moderate - Use with additional validation"}
              </p>
            </div>
          </div>

          {/* R² Score Interpretation */}
          <div className="flex items-start space-x-3">
            <div className="text-2xl">
              {metrics.r2_score >= 0.9 ? "🟢" :
               metrics.r2_score >= 0.7 ? "🔵" :
               metrics.r2_score >= 0.5 ? "🟡" : "🟠"}
            </div>
            <div>
              <h5 className="font-semibold text-gray-300">Model Fit Quality</h5>
              <p className="text-sm text-gray-400">
                {metrics.r2_score >= 0.9 ? "Excellent fit - Model explains variance very well" :
                 metrics.r2_score >= 0.7 ? "Good fit - Model captures most patterns" :
                 metrics.r2_score >= 0.5 ? "Moderate fit - Some patterns captured" :
                 "Weak fit - Consider model improvements"}
              </p>
            </div>
          </div>

          {/* Error Magnitude */}
          <div className="flex items-start space-x-3">
            <div className="text-2xl">📊</div>
            <div>
              <h5 className="font-semibold text-gray-300">Prediction Error</h5>
              <p className="text-sm text-gray-400">
                On average, predictions deviate by <span className="font-semibold text-purple-400">{metrics.mae?.toFixed(2)} μg/m³</span> (MAE)
                with a root mean squared error of <span className="font-semibold text-pink-400">{metrics.rmse?.toFixed(2)} μg/m³</span> (RMSE).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Explanation */}
      <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 p-6 rounded-lg border border-gray-600/30">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">ℹ️ Understanding the Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-green-400">MAE (Mean Absolute Error):</span>
              <p className="text-gray-400">Average absolute difference between predicted and actual values. More intuitive and less sensitive to outliers.</p>
            </div>
            <div>
              <span className="font-semibold text-blue-400">MSE (Mean Squared Error):</span>
              <p className="text-gray-400">Average squared difference. Penalizes larger errors more, useful for detecting significant deviations.</p>
            </div>
            <div>
              <span className="font-semibold text-purple-400">RMSE (Root Mean Squared Error):</span>
              <p className="text-gray-400">Square root of MSE, in same units as the target variable. Commonly used for model comparison.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-yellow-400">R² Score:</span>
              <p className="text-gray-400">Proportion of variance explained by the model. 1.0 = perfect predictions, 0.0 = no better than mean.</p>
            </div>
            <div>
              <span className="font-semibold text-cyan-400">MAPE:</span>
              <p className="text-gray-400">Percentage error relative to actual values. Easy to interpret but can be problematic with values near zero.</p>
            </div>
            <div>
              <span className="font-semibold text-pink-400">Accuracy:</span>
              <p className="text-gray-400">Calculated as (100 - MAPE). Represents overall prediction accuracy as a percentage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelEvaluation;
