import React, { useState } from "react";

//TODO: SET alerts in results display by user. (user will give number and if predicted aqi > number, alert will be sent to his sms)

function Result({ result }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.prompt || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset copy status
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-teal-400">Results</h2>

      {result.predictions && result.predictions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 rounded-lg">
            <thead className="bg-gray-800 text-teal-400">
              <tr>
                <th className="px-4 py-2 border-b border-gray-700">Date</th>
                <th className="px-4 py-2 border-b border-gray-700">Predicted AQI</th>
                <th className="px-4 py-2 border-b border-gray-700">Haze Intensity</th>
              </tr>
            </thead>
            <tbody>
              {result.predictions.map((p, idx) => (
                <tr key={idx} className="even:bg-gray-800 odd:bg-gray-900">
                  <td className="px-4 py-2 border-b border-gray-700">{p.date}</td>
                  <td className="px-4 py-2 border-b border-gray-700">{p.predicted_aqi.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b border-gray-700">{p.haze_intensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.image_url && (
  <div className="mt-4">
    <a
      href={result.image_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-between w-full max-w-sm px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
    >
      <span>View LLM Smog Visualization</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 ml-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
  </div>
)}

      {result.prompt && (
        <div className="mt-4">
          <label className="block font-semibold mb-1">Prompt:</label>
          <div className="flex gap-2">
            <textarea
              readOnly
              value={result.prompt}
              className="flex-1 p-2 rounded-md bg-gray-800 text-white border border-gray-600"
              rows={3}
            />
            <button
              onClick={handleCopy}
              className="bg-teal-400 hover:bg-teal-500 text-black font-semibold px-3 rounded-md"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;
