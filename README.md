# AQI Smog Forecast Project

A comprehensive Air Quality Index (AQI) prediction and visualization application that combines time-series forecasting with intelligent image processing and AI-powered visualization generation.

## Features

- **AQI Prediction**: Uses Facebook Prophet for 30-day AQI forecasting based on historical PM2.5 data
- **Smart Image Processing**: Applies dynamic haze overlays to reference images based on predicted pollution levels
- **AI Visualization**: Generates prompts for Google Gemini to create realistic smog visualizations
- **Modern Web Interface**: Clean, responsive React frontend with dark mode design
- **Fast API Backend**: High-performance FastAPI server with real-time processing
- **Interactive Results**: Tabular prediction data with visual haze intensity indicators

## Architecture

### Frontend (React + Vite)
- **Framework**: React 19 with Vite for fast development
- **Styling**: TailwindCSS 4.1 for modern, responsive design
- **HTTP Client**: Axios for API communication
- **Features**: File upload, real-time processing feedback, results visualization

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high-performance API
- **ML/Forecasting**: Facebook Prophet for time-series prediction
- **Image Processing**: OpenCV for haze overlay generation
- **Data Processing**: Pandas for CSV data handling
- **Visualization**: Matplotlib and Plotly for data visualization

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dev1abhi/AQI-project.git
   cd AQI-project
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Setup Frontend**
   ```bash
   cd ../aqi-frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Backend will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   cd aqi-frontend
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

### Building for Production

1. **Frontend Build**
   ```bash
   cd aqi-frontend
   npm run build
   ```

2. **Backend Production**
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Usage

### Data Format Requirements

**CSV Dataset Format:**
```csv
date,pm25
01/01/2023,45.2
02/01/2023,52.1
03/01/2023,38.9
...
```
- `date`: Date in DD/MM/YYYY format
- `pm25`: PM2.5 concentration values (numerical)

**Reference Image:**
- Any common image format (JPG, PNG, etc.)
- Recommended: Clear images for better haze visualization
- Example: Landscape photos, city skylines, monuments

### Step-by-Step Process

1. **Upload Files**
   - Select your CSV dataset with historical AQI/PM2.5 data
   - Choose a reference image for haze visualization

2. **Processing**
   - The system analyzes historical trends using Prophet
   - Generates 30-day AQI predictions
   - Applies calculated haze intensity to your reference image

3. **Results**
   - View detailed prediction table with dates, AQI values, and haze intensity
   - Access AI-generated visualization prompts for Google Gemini
   - Copy prompts to generate realistic smog visualizations

## AQI Calculation & Haze Mapping

The application uses the following AQI to haze intensity mapping:

| AQI Range | Air Quality | Haze Intensity | Description |
|-----------|-------------|----------------|-------------|
| 0-50      | Good        | 0              | No haze overlay |
| 51-100    | Moderate    | 25             | Light haze |
| 101-200   | Unhealthy   | 60             | Moderate haze |
| 201-300   | Very Unhealthy | 100         | Heavy haze |
| 301-400   | Hazardous   | 140            | Very heavy haze |
| 400+      | Extremely Hazardous | 180    | Maximum haze |

## Development

### Frontend Development
```bash
cd aqi-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
uvicorn app.main:app --reload  # Start with auto-reload
```

### Code Quality
- **Frontend**: ESLint with React hooks and refresh plugins
- **Backend**: FastAPI with Pydantic for request validation
- **Styling**: TailwindCSS with consistent dark theme

## 🌐 Deployment

### Frontend Deployment (Render)
- Deployed at: `https://aqi-app-frontend.onrender.com`
- Automatic deployments from main branch
- Vite build optimization enabled

### Backend Deployment (Render)
- Deployed at: `https://aqi-app-backend.onrender.com`
- Configuration in `backend/render.yaml`
- Auto-scaling and environment management

## 📁 Project Structure

```
AQI-project/
├── aqi-frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.jsx    # File upload interface
│   │   │   └── Result.jsx        # Results display component
│   │   ├── App.jsx               # Main application component
│   │   └── main.jsx              # Application entry point
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
├── backend/                      # FastAPI backend application
│   ├── app/
│   │   └── main.py               # Main API application
│   ├── requirements.txt          # Python dependencies
│   └── render.yaml               # Render deployment config
└── README.md                     # This file
```

## API Endpoints

### POST `/process`
Processes uploaded CSV and image files to generate AQI predictions.

**Request:**
- `dataset`: CSV file with date and pm25 columns
- `ref_image`: Image file for haze visualization

**Response:**
```json
{
  "predictions": [
    {
      "date": "2024-01-01",
      "predicted_aqi": 75.23,
      "haze_intensity": 25
    },
    ...
  ],
  "image_url": "https://gemini.google.com/app?prompt=...",
  "prompt": "A realistic photo of Delhi's India Gate covered in smog, air pollution level AQI 75, haze intensity 25"
}
```

### GET `/download`
Downloads the generated haze-overlaid image.

**Response:** JPEG image file

## Future Enhancements

- [ ] SMS/Email alerts for high AQI predictions
- [ ] Historical data visualization charts
- [ ] Multiple city support
- [ ] Real-time AQI data integration
- [ ] Advanced image processing filters
- [ ] API key integration for AI services
- [ ] Mobile application development

## Troubleshooting

### Common Issues

1. **CSV Upload Fails**
   - Ensure CSV has 'date' and 'pm25' columns
   - Check date format is DD/MM/YYYY
   - Verify numerical PM2.5 values

2. **Backend Connection Issues**
   - Verify backend server is running on port 8000
   - Check CORS configuration in main.py
   - Ensure all Python dependencies are installed

3. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all npm dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## 👨Author

**dev1abhi** - [GitHub Profile](https://github.com/dev1abhi)

## Acknowledgments

- **Facebook Prophet** for time-series forecasting capabilities
- **FastAPI** for high-performance API framework
- **React + Vite** for modern frontend development
- **TailwindCSS** for rapid UI development
- **OpenCV** for image processing capabilities
- **Render** for deployment platform

---

*For support or questions, please open an issue on GitHub.*