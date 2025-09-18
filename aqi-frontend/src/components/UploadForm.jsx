import React, { useState } from "react";
import axios from "axios";

function UploadForm({ setResult }) {
  const [dataset, setDataset] = useState(null);
  const [refImage, setRefImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dataset || !refImage) {
      alert("Please upload both CSV dataset and reference image.");
      return;
    }

    const formData = new FormData();
    formData.append("dataset", dataset);
    formData.append("ref_image", refImage);

    try {
      setLoading(true);
      const res = await axios.post(
        "https://aqi-app-backend.onrender.com/process",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error uploading files!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Dataset CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setDataset(e.target.files[0])}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Reference Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setRefImage(e.target.files[0])}
          className="border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Processing..." : "Process"}
      </button>
    </form>
  );
}

export default UploadForm;
