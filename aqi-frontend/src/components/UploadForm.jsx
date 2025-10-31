// components/UploadForm.js
import React, { useState } from "react";
import axios from "axios";
import { FileText, Image, Upload, Rocket } from "lucide-react";

function UploadForm({ setResult, setLoading, setError }) {
  const [dataset, setDataset] = useState(null);
  const [refImage, setRefImage] = useState(null);
  const [dragActive, setDragActive] = useState({ csv: false, image: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!dataset) {
      setError("Please upload a CSV dataset file.");
      return;
    }

    const formData = new FormData();
    formData.append("dataset", dataset);
    if (refImage) {
      formData.append("ref_image", refImage);
    }

    try {
      setLoading(true);
      setResult(null);

      const res = await axios.post(
        "https://aqi-app-backend.onrender.com/analyze", // Updated endpoint
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000, // 2 minute timeout
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.detail || err.message || "Analysis failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === "csv") {
        setDataset(e.dataTransfer.files[0]);
      } else if (type === "image") {
        setRefImage(e.dataTransfer.files[0]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">
          Upload Your Data
        </h2>
        <p className="text-gray-400">
          CSV dataset is required. Reference image is optional for smog
          visualization.
        </p>
      </div>

      {/* CSV Upload */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-gray-300">
          <FileText className="w-5 h-5" />
          Air Quality Dataset (CSV) *
        </label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
            dragActive.csv
              ? "border-teal-400 bg-teal-400/5"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDragEnter={(e) => handleDrag(e, "csv")}
          onDragLeave={(e) => handleDrag(e, "csv")}
          onDragOver={(e) => handleDrag(e, "csv")}
          onDrop={(e) => handleDrop(e, "csv")}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setDataset(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            {dataset ? (
              <div>
                <p className="text-teal-400 font-medium">{dataset.name}</p>
                <p className="text-sm text-gray-400">CSV file selected</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 font-medium">
                  Drop CSV file here or click to browse
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Should contain columns: date, pm25 (and optionally pm10, o3,
                  no2, so2, co)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-gray-300">
          <Image className="w-5 h-5" />
          Reference Image (Optional)
        </label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
            dragActive.image
              ? "border-teal-400 bg-teal-400/5"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDragEnter={(e) => handleDrag(e, "image")}
          onDragLeave={(e) => handleDrag(e, "image")}
          onDragOver={(e) => handleDrag(e, "image")}
          onDrop={(e) => handleDrop(e, "image")}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRefImage(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            {refImage ? (
              <div>
                <p className="text-teal-400 font-medium">{refImage.name}</p>
                <p className="text-sm text-gray-400">Image file selected</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 font-medium">
                  Drop image here or click to browse
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  For smog effect simulation (JPG, PNG, etc.)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        disabled={!dataset}
      >
        <Rocket className="w-5 h-5" />
        Start Analysis
      </button>
    </form>
  );
}

export default UploadForm;
