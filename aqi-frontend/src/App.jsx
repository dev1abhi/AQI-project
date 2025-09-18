import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import Result from "./components/Result";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-teal-400 mb-6">AQI Smog Forecast</h1>

      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <UploadForm setResult={setResult} />
      </div>

      {result && (
        <div className="w-full max-w-xl mt-6 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <Result result={result} />
        </div>
      )}
    </div>
  );
}

export default App;
