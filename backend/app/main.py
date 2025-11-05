from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
import cv2
from prophet import Prophet
import matplotlib.pyplot as plt
import seaborn as sns
import base64
import io
import os
import warnings
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
from urllib.parse import quote_plus
import logging
import shutil
import psutil

warnings.filterwarnings('ignore')

# Configure logging for disk space monitoring
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Air Quality Analysis API", version="2.0.0")

# ================================
# GLOBAL EXCEPTION HANDLER
# ================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to prevent server crashes"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Try to return a structured error response
    try:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": "Internal server error",
                "detail": "An unexpected error occurred. Please try again.",
                "path": str(request.url)
            }
        )
    except Exception as e:
        # Absolute last resort
        logger.error(f"Failed to create global error response: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Critical error"}
        )

# ================================
# DISK SPACE MONITORING FUNCTIONS
# ================================

def get_disk_space_info():
    """Get comprehensive disk space information for the Render instance"""
    try:
        # Get disk usage for the current directory (root filesystem in most containers)
        statvfs = shutil.disk_usage('/')
        
        total_space = statvfs.total
        used_space = statvfs.used
        free_space = statvfs.free
        
        # Convert bytes to human readable format
        def bytes_to_human_readable(bytes_value):
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if bytes_value < 1024.0:
                    return f"{bytes_value:.2f} {unit}"
                bytes_value /= 1024.0
            return f"{bytes_value:.2f} PB"
        
        usage_percentage = (used_space / total_space) * 100
        
        disk_info = {
            "total_space": bytes_to_human_readable(total_space),
            "used_space": bytes_to_human_readable(used_space),
            "free_space": bytes_to_human_readable(free_space),
            "usage_percentage": f"{usage_percentage:.2f}%",
            "raw_bytes": {
                "total": total_space,
                "used": used_space,
                "free": free_space
            }
        }
        
        return disk_info
        
    except Exception as e:
        logger.error(f"Error getting disk space info: {str(e)}")
        return {"error": str(e)}

def get_memory_info():
    """Get memory usage information"""
    try:
        # Get memory usage using psutil if available, otherwise use basic methods
        try:
            import psutil
            memory = psutil.virtual_memory()
            memory_info = {
                "total_memory": f"{memory.total / (1024**3):.2f} GB",
                "available_memory": f"{memory.available / (1024**3):.2f} GB",
                "used_memory": f"{memory.used / (1024**3):.2f} GB",
                "memory_percentage": f"{memory.percent:.2f}%"
            }
        except ImportError:
            # Fallback method without psutil
            with open('/proc/meminfo', 'r') as f:
                meminfo = f.read()
            
            total_mem = 0
            free_mem = 0
            available_mem = 0
            
            for line in meminfo.split('\n'):
                if 'MemTotal:' in line:
                    total_mem = int(line.split()[1]) * 1024  # Convert KB to bytes
                elif 'MemFree:' in line:
                    free_mem = int(line.split()[1]) * 1024
                elif 'MemAvailable:' in line:
                    available_mem = int(line.split()[1]) * 1024
            
            used_mem = total_mem - available_mem if available_mem else total_mem - free_mem
            usage_percentage = (used_mem / total_mem) * 100 if total_mem > 0 else 0
            
            memory_info = {
                "total_memory": f"{total_mem / (1024**3):.2f} GB",
                "available_memory": f"{available_mem / (1024**3):.2f} GB",
                "used_memory": f"{used_mem / (1024**3):.2f} GB",
                "memory_percentage": f"{usage_percentage:.2f}%"
            }
        
        return memory_info
        
    except Exception as e:
        logger.error(f"Error getting memory info: {str(e)}")
        return {"error": str(e)}

def log_system_resources():
    """Log comprehensive system resource information"""
    logger.info("=" * 60)
    logger.info("RENDER INSTANCE SYSTEM RESOURCES")
    logger.info("=" * 60)
    
    # Log disk space
    disk_info = get_disk_space_info()
    if "error" not in disk_info:
        logger.info("DISK SPACE INFORMATION:")
        logger.info(f"  Total Space: {disk_info['total_space']}")
        logger.info(f"  Used Space:  {disk_info['used_space']}")
        logger.info(f"  Free Space:  {disk_info['free_space']}")
        logger.info(f"  Usage:       {disk_info['usage_percentage']}")
    else:
        logger.error(f"Disk space error: {disk_info['error']}")
    
    # Log memory usage
    memory_info = get_memory_info()
    if "error" not in memory_info:
        logger.info("MEMORY INFORMATION:")
        logger.info(f"  Total Memory:     {memory_info['total_memory']}")
        logger.info(f"  Available Memory: {memory_info['available_memory']}")
        logger.info(f"  Used Memory:      {memory_info['used_memory']}")
        logger.info(f"  Usage:            {memory_info['memory_percentage']}")
    else:
        logger.error(f"Memory info error: {memory_info['error']}")
    
    # Log additional system info
    try:
        import os
        logger.info("ENVIRONMENT INFORMATION:")
        logger.info(f"  Python Version: {os.sys.version}")
        logger.info(f"  Current Working Directory: {os.getcwd()}")
        logger.info(f"  Process ID: {os.getpid()}")
        
        # Check if we're running on Render
        render_service = os.getenv('RENDER_SERVICE_NAME', 'Not set')
        render_instance = os.getenv('RENDER_INSTANCE_ID', 'Not set')
        logger.info(f"  Render Service: {render_service}")
        logger.info(f"  Render Instance: {render_instance}")
        
    except Exception as e:
        logger.error(f"Error getting environment info: {str(e)}")
    
    logger.info("=" * 60)

# Initialize and log system resources when the app starts
log_system_resources()

# Periodic logging function (can be called periodically)
def periodic_system_check():
    """Periodic system resource check - can be called by external scheduler"""
    logger.info("Periodic system resource check:")
    disk_info = get_disk_space_info()
    memory_info = get_memory_info()
    
    if "error" not in disk_info:
        logger.info(f"Disk Usage: {disk_info['usage_percentage']} ({disk_info['free_space']} free)")
    
    if "error" not in memory_info:
        logger.info(f"Memory Usage: {memory_info['memory_percentage']}")
    
    # Check for low disk space warning (less than 1GB free)
    if "error" not in disk_info and disk_info['raw_bytes']['free'] < 1024**3:
        logger.warning("⚠️  LOW DISK SPACE WARNING: Less than 1GB free space remaining!")
    
    # Check for high memory usage (more than 90%)
    if "error" not in memory_info:
        try:
            mem_usage = float(memory_info['memory_percentage'].replace('%', ''))
            if mem_usage > 90:
                logger.warning(f"⚠️  HIGH MEMORY USAGE WARNING: {mem_usage}% memory usage!")
        except:
            pass

# CORS setup
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://aqi-app-frontend.onrender.com",
    "https://aqi-project-rose.vercel.app",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for file storage
os.makedirs("temp", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("plots", exist_ok=True)

# Mount static files
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/plots", StaticFiles(directory="plots"), name="plots")

# ================================
# UTILITY FUNCTIONS
# ================================

def find_column(df: pd.DataFrame, possible_names: List[str]) -> Optional[str]:
    """Find column by checking multiple possible names (case-insensitive)"""
    df_cols_lower = [col.lower().strip() for col in df.columns]
    for name in possible_names:
        if name.lower() in df_cols_lower:
            return df.columns[df_cols_lower.index(name.lower())]
    return None

def classify_aqi(aqi_value: float) -> Tuple[str, str]:
    """Classify AQI value and return category with color"""
    if aqi_value <= 50:
        return "Good", "#00e400"
    elif aqi_value <= 100:
        return "Moderate", "#ffff00"
    elif aqi_value <= 150:
        return "Unhealthy for Sensitive Groups", "#ff7e00"
    elif aqi_value <= 200:
        return "Unhealthy", "#ff0000"
    elif aqi_value <= 300:
        return "Very Unhealthy", "#8f3f97"
    else:
        return "Hazardous", "#7e0023"

def safe_float(value, default=0.0):
    """Convert value to float, handling NaN, inf, and None values safely"""
    try:
        if value is None:
            return default
        
        # Convert to float
        float_val = float(value)
        
        # Check for NaN or infinite values
        if np.isnan(float_val) or np.isinf(float_val):
            return default
            
        return float_val
    except (ValueError, TypeError, OverflowError):
        return default

def clean_response_data(data):
    """Recursively clean response data to remove NaN, inf, and None values"""
    if isinstance(data, dict):
        return {k: clean_response_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_response_data(item) for item in data]
    elif isinstance(data, float):
        return safe_float(data)
    else:
        return data

def safe_series_stats(series, default=0.0):
    """Calculate statistics from pandas series, handling NaN values safely"""
    if series is None or len(series) == 0:
        return {
            "mean": default,
            "median": default,
            "max": default,
            "min": default,
            "std": default
        }
    
    # Drop NaN values for calculations
    clean_series = series.dropna()
    
    if len(clean_series) == 0:
        return {
            "mean": default,
            "median": default, 
            "max": default,
            "min": default,
            "std": default
        }
    
    return {
        "mean": safe_float(clean_series.mean(), default),
        "median": safe_float(clean_series.median(), default),
        "max": safe_float(clean_series.max(), default),
        "min": safe_float(clean_series.min(), default),
        "std": safe_float(clean_series.std(), default)
    }

def aqi_to_haze_intensity(aqi: float) -> int:
    """Convert AQI to haze intensity (0-200)"""
    if aqi <= 50: return 0
    elif aqi <= 100: return 30
    elif aqi <= 150: return 60
    elif aqi <= 200: return 100
    elif aqi <= 300: return 150
    else: return 200

def apply_atmospheric_effects(image: np.ndarray, aqi_value: float, intensity: int) -> np.ndarray:
    """Apply various atmospheric effects based on AQI level"""
    result = image.copy().astype(np.float32)
    
    if aqi_value <= 50:
        return image
    elif aqi_value <= 100:
        yellow_tint = np.full_like(result, [0, 200, 255])
        result = cv2.addWeighted(result, 0.9, yellow_tint, 0.1, 0)
    elif aqi_value <= 150:
        brown_haze = np.full_like(result, [100, 150, 200])
        result = cv2.addWeighted(result, 0.8, brown_haze, 0.2, 0)
    elif aqi_value <= 200:
        thick_smog = np.full_like(result, [120, 120, 150])
        result = cv2.addWeighted(result, 0.6, thick_smog, 0.4, 0)
    elif aqi_value <= 300:
        dark_smog = np.full_like(result, [80, 80, 120])
        result = cv2.addWeighted(result, 0.4, dark_smog, 0.6, 0)
    else:
        extreme_smog = np.full_like(result, [60, 60, 90])
        result = cv2.addWeighted(result, 0.3, extreme_smog, 0.7, 0)
    
    # Add general haze effect
    haze = np.full_like(result, [200, 200, 200])
    alpha = min(intensity / 255.0, 0.8)
    result = cv2.addWeighted(result, 1-alpha, haze, alpha, 0)
    
    return np.clip(result, 0, 255).astype(np.uint8)

#can generate this using LLM
def get_detailed_health_recommendations(aqi_value: float) -> Dict[str, str]:
    """Get comprehensive health recommendations based on AQI"""
    recommendations = {
        'general': '',
        'sensitive': '',
        'activities': '',
        'precautions': '',
        'risk_level': ''
    }
    
    if aqi_value <= 50:
        recommendations.update({
            'general': "Air quality is satisfactory for the general population",
            'sensitive': "No restrictions for sensitive groups",
            'activities': "All outdoor activities recommended",
            'precautions': "None required",
            'risk_level': "LOW"
        })
    elif aqi_value <= 100:
        recommendations.update({
            'general': "Air quality is acceptable for most people",
            'sensitive': "Unusually sensitive people should consider reducing prolonged outdoor exertion",
            'activities': "Outdoor activities acceptable",
            'precautions': "Sensitive individuals should monitor symptoms",
            'risk_level': "LOW"
        })
    elif aqi_value <= 150:
        recommendations.update({
            'general': "General public not likely to be affected",
            'sensitive': "People with heart/lung disease, children, and older adults should reduce prolonged outdoor exertion",
            'activities': "Reduce intense outdoor activities for sensitive groups",
            'precautions': "Consider wearing masks outdoors, keep windows closed",
            'risk_level': "MODERATE"
        })
    elif aqi_value <= 200:
        recommendations.update({
            'general': "Everyone may begin to experience health effects",
            'sensitive': "People with heart/lung disease, children, and older adults should avoid prolonged outdoor exertion",
            'activities': "Limit outdoor activities, especially for children and elderly",
            'precautions': "Wear N95 masks, use air purifiers indoors, avoid outdoor exercise",
            'risk_level': "MODERATE"
        })
    elif aqi_value <= 300:
        recommendations.update({
            'general': "Health alert: everyone may experience serious health effects",
            'sensitive': "People with heart/lung disease, children, and older adults should remain indoors",
            'activities': "Avoid all outdoor activities",
            'precautions': "Stay indoors, seal windows/doors, use air purifiers, wear masks if must go outside",
            'risk_level': "HIGH"
        })
    else:
        recommendations.update({
            'general': "Emergency conditions: entire population likely to be affected",
            'sensitive': "Everyone should remain indoors and avoid physical activities",
            'activities': "Remain indoors at all times",
            'precautions': "Emergency protocols: stay indoors, seal home, medical attention for symptoms",
            'risk_level': "EMERGENCY"
        })
    
    return recommendations

def calculate_detailed_aqi(pollutant_concentrations: Dict[str, float]) -> Dict[str, int]:
    """Calculate detailed AQI for multiple pollutants using EPA breakpoints"""
    # EPA breakpoints are the concentration thresholds for specific air pollutants that define
    # the different levels of the Air Quality Index (AQI), such as "Good," "Moderate," and "Unhealthy"
    breakpoints = {
        'pm25': [(0.0, 12.0, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150),
                 (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300), (250.5, 500.4, 301, 500)],
        'pm10': [(0, 54, 0, 50), (55, 154, 51, 100), (155, 254, 101, 150),
                 (255, 354, 151, 200), (355, 424, 201, 300), (425, 604, 301, 500)],
        'o3': [(0, 54, 0, 50), (55, 70, 51, 100), (71, 85, 101, 150),
               (86, 105, 151, 200), (106, 200, 201, 300)],
        'no2': [(0, 53, 0, 50), (54, 100, 51, 100), (101, 360, 101, 150),
                (361, 649, 151, 200), (650, 1249, 201, 300)],
        'so2': [(0, 35, 0, 50), (36, 75, 51, 100), (76, 185, 101, 150),
                (186, 304, 151, 200), (305, 604, 201, 300)],
        'co': [(0, 4.4, 0, 50), (4.5, 9.4, 51, 100), (9.5, 12.4, 101, 150),
               (12.5, 15.4, 151, 200), (15.5, 30.4, 201, 300)]
    }
    
    def get_aqi_from_concentration(pollutant, concentration):
        if pollutant not in breakpoints or concentration is None:
            return None
        
        for bp_low, bp_high, aqi_low, aqi_high in breakpoints[pollutant]:
            if bp_low <= concentration <= bp_high:
                aqi = ((aqi_high - aqi_low) / (bp_high - bp_low)) * (concentration - bp_low) + aqi_low
                return round(aqi)
        
        return 500  # If concentration exceeds all breakpoints
    
    aqi_values = {}
    for pollutant, concentration in pollutant_concentrations.items():
        if concentration is not None:
            aqi = get_aqi_from_concentration(pollutant, concentration)
            if aqi is not None:
                aqi_values[pollutant] = aqi
    
    return aqi_values

def create_forecast_plot(aqi_df: pd.DataFrame, forecast: pd.DataFrame, predicted_aqi: float) -> str:
    """Create comprehensive forecast visualization and return base64 encoded image"""
    # Ensure predicted_aqi is safe for visualization
    predicted_aqi = safe_float(predicted_aqi)
    
    #using seaborn
    plt.style.use('seaborn-v0_8')
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Historical data plot
    axes[0,0].plot(aqi_df['ds'], aqi_df['y'], label='Historical Data', color='blue', alpha=0.7)
    axes[0,0].set_title('Historical Air Quality Data', fontweight='bold')
    axes[0,0].set_xlabel('Date')
    axes[0,0].set_ylabel('PM2.5/AQI')
    axes[0,0].legend()
    axes[0,0].tick_params(axis='x', rotation=45)
    axes[0,0].grid(True, alpha=0.3)
    
    # Forecast plot (30 days)
    forecast_recent = forecast.tail(60)
    axes[0,1].plot(forecast_recent['ds'], forecast_recent['yhat'], label='Forecast', color='red', linewidth=2)
    axes[0,1].fill_between(forecast_recent['ds'],
                           forecast_recent['yhat_lower'],
                           forecast_recent['yhat_upper'],
                           alpha=0.3, color='red')
    axes[0,1].axhline(y=predicted_aqi, color='darkred', linestyle='--', linewidth=2)
    axes[0,1].set_title('30-Day Forecast with Confidence Bands', fontweight='bold')
    axes[0,1].set_xlabel('Date')
    axes[0,1].set_ylabel('Predicted PM2.5/AQI')
    axes[0,1].legend()
    axes[0,1].tick_params(axis='x', rotation=45)
    axes[0,1].grid(True, alpha=0.3)
    
    # Trend analysis
    axes[1,0].plot(forecast['ds'], forecast['trend'], label='Long-term Trend', color='green', linewidth=2)
    axes[1,0].set_title('Air Quality Trend Analysis', fontweight='bold')
    axes[1,0].set_xlabel('Date')
    axes[1,0].set_ylabel('PM2.5 Trend')
    axes[1,0].legend()
    axes[1,0].grid(True, alpha=0.3)
    axes[1,0].tick_params(axis='x', rotation=45)
    
    # Recent data with moving average
    recent_data = aqi_df.tail(90)
    axes[1,1].plot(recent_data['ds'], recent_data['y'], alpha=0.5, color='blue', label='Daily Values')
    axes[1,1].plot(recent_data['ds'], recent_data['y'].rolling(7).mean(),
                   label='7-day Average', color='red', linewidth=2)
    axes[1,1].set_title('Recent Data with Moving Average', fontweight='bold')
    axes[1,1].set_xlabel('Date')
    axes[1,1].set_ylabel('PM2.5')
    axes[1,1].legend()
    axes[1,1].grid(True, alpha=0.3)
    axes[1,1].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    
    # Convert plot to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plot_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    return base64.b64encode(plot_data).decode('utf-8')

#image visualisation
def create_aqi_gauge(predicted_aqi: float, aqi_category: str) -> str:
    """Create AQI gauge visualization and return base64 encoded image"""
    # Ensure predicted_aqi is safe for visualization
    predicted_aqi = safe_float(predicted_aqi)
    
    fig, ax = plt.subplots(figsize=(8, 6), subplot_kw=dict(projection='polar'))
    
    # AQI color zones
    colors = ['#00e400', '#ffff00', '#ff7e00', '#ff0000', '#8f3f97', '#7e0023']
    boundaries = [0, 50, 100, 150, 200, 300, 500]
    labels = ['Good', 'Moderate', 'Unhealthy\nfor Sensitive', 'Unhealthy',
              'Very\nUnhealthy', 'Hazardous']
    
    theta = np.linspace(0, np.pi, 100)
    
    for i in range(len(boundaries)-1):
        start_angle = (boundaries[i] / 500) * np.pi
        end_angle = (boundaries[i+1] / 500) * np.pi
        theta_segment = np.linspace(start_angle, end_angle, 20)
        ax.fill_between(theta_segment, 0.7, 1.0, color=colors[i], alpha=0.8)
        
        # Add labels
        mid_angle = (start_angle + end_angle) / 2
        ax.text(mid_angle, 0.6, labels[i], ha='center', va='center',
                fontsize=10, fontweight='bold')
    
    # Add AQI pointer and value
    aqi_normalized = min(predicted_aqi / 500, 1.0)
    pointer_angle = aqi_normalized * np.pi
    ax.plot([pointer_angle, pointer_angle], [0, 0.9], 'k-', linewidth=4)
    ax.plot(pointer_angle, 0.85, 'ko', markersize=12)
    ax.text(np.pi/2, 0.3, f'{predicted_aqi:.0f}', ha='center', va='center',
            fontsize=24, fontweight='bold')
    ax.text(np.pi/2, 0.1, 'AQI Level', ha='center', va='center',
            fontsize=14, fontweight='bold')
    ax.text(np.pi/2, -0.05, aqi_category, ha='center', va='center',
            fontsize=12, fontweight='bold', color='red')
    
    ax.set_xlim(0, np.pi)
    ax.set_ylim(0, 1)
    ax.set_title('Air Quality Index Gauge', fontsize=16, fontweight='bold', pad=20)
    ax.axis('off')
    
    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plot_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    return base64.b64encode(plot_data).decode('utf-8')

# ================================
# API ENDPOINTS
# ================================

@app.get("/")
async def root():
    return {"message": "Air Quality Analysis API v2.0", "status": "active"}

@app.post("/analyze")
async def analyze_air_quality(
    dataset: UploadFile = File(...),
    ref_image: UploadFile = File(None)
):
    """
    Comprehensive air quality analysis with forecasting and visualization
    """
    try:
        logger.info("Starting analysis request")
        
        # ============================
        # STEP 1: Load and Process Data
        # ============================
        
        try:
            # Read CSV data
            df = pd.read_csv(dataset.file)
            df.columns = df.columns.str.strip()
            logger.info(f"Successfully loaded dataset with {len(df)} rows and columns: {df.columns.tolist()}")
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error reading CSV file: {str(e)}. Please ensure the file is a valid CSV format."
            )
        
        try:
            # Automatically detect columns
            date_names = ['date', 'datetime', 'timestamp', 'time']
            pm25_names = ['pm25', 'pm2.5', 'pm_25', 'aqi', 'pm25_avg']
            
            date_col = find_column(df, date_names)
            pm25_col = find_column(df, pm25_names)
            
            if not date_col or not pm25_col:
                raise HTTPException(
                    status_code=400,
                    detail=f"Required columns not found. Available: {df.columns.tolist()}. Please ensure your CSV has date and PM2.5/AQI columns."
                )
            
            logger.info(f"Detected columns - Date: {date_col}, PM2.5: {pm25_col}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error detecting columns: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing CSV columns: {str(e)}"
            )
        
        try:
            # Detect additional parameters
            additional_params = {}
            param_names = {
                'pm10': ['pm10', 'pm_10'],
                'o3': ['o3', 'ozone'],
                'no2': ['no2', 'nitrogen_dioxide'],
                'so2': ['so2', 'sulfur_dioxide'],
                'co': ['co', 'carbon_monoxide']
            }
            
            for param, names in param_names.items():
                col = find_column(df, names)
                if col:
                    additional_params[param] = col
            
            logger.info(f"Additional parameters detected: {additional_params}")
        except Exception as e:
            logger.warning(f"Error detecting additional parameters: {str(e)}")
            additional_params = {}
        
        try:
            # Parse dates
            try:
                df[date_col] = pd.to_datetime(df[date_col], dayfirst=True, errors='coerce')
            except:
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            
            # Prepare data for Prophet
            aqi_df = df[[date_col, pm25_col]].rename(columns={date_col:'ds', pm25_col:'y'})
            aqi_df['y'] = pd.to_numeric(aqi_df['y'], errors='coerce')
            aqi_df = aqi_df.dropna()
            
            # Sort by date to ensure chronological order (important for getting latest values)
            aqi_df = aqi_df.sort_values('ds').reset_index(drop=True)
            
            if len(aqi_df) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="No valid data found after processing. Please check your date and PM2.5 columns for valid values."
                )
            
            logger.info(f"Processed {len(aqi_df)} valid data points")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing date/PM2.5 data: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing date and PM2.5 data: {str(e)}"
            )
        
        # ============================
        # STEP 2: Forecasting with Prophet
        # ============================
        
        try:
            logger.info("Starting Prophet forecasting")
            model = Prophet(daily_seasonality=True, yearly_seasonality=True)
            model.fit(aqi_df)
            
            # Forecast next 30 days
            future = model.make_future_dataframe(periods=30)
            forecast = model.predict(future)
            
            predicted_aqi = safe_float(forecast.iloc[-1]['yhat'])
            aqi_category, aqi_color = classify_aqi(predicted_aqi)
            
            # Calculate model evaluation metrics
            # Get predictions for historical data
            historical_forecast = forecast[forecast['ds'].isin(aqi_df['ds'])]
            actual_values = aqi_df['y'].values
            predicted_values = historical_forecast['yhat'].values
            
            # Calculate metrics
            from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
            
            mae = safe_float(mean_absolute_error(actual_values, predicted_values))
            mse = safe_float(mean_squared_error(actual_values, predicted_values))
            rmse = safe_float(np.sqrt(mse))
            r2 = safe_float(r2_score(actual_values, predicted_values))
            
            # Calculate MAPE (Mean Absolute Percentage Error)
            mape = safe_float(np.mean(np.abs((actual_values - predicted_values) / actual_values)) * 100)
            
            model_metrics = {
                "mae": mae,  # Mean Absolute Error
                "mse": mse,  # Mean Squared Error
                "rmse": rmse,  # Root Mean Squared Error
                "r2_score": r2,  # R-squared score (coefficient of determination)
                "mape": mape,  # Mean Absolute Percentage Error (%)
                "accuracy_percentage": safe_float(100 - mape) if mape < 100 else 0.0
            }
            
            logger.info(f"Forecasting completed. Predicted AQI: {predicted_aqi}, R²: {r2:.4f}, RMSE: {rmse:.2f}")
        except Exception as e:
            logger.error(f"Error in Prophet forecasting: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error in forecasting model: {str(e)}. Please check your data quality and try again."
            )
        
        # ============================
        # STEP 3: Statistical Analysis
        # ============================
        
        try:
            logger.info("Calculating statistics")
            # Get the most recent 30 data points (already sorted chronologically)
            recent_data = aqi_df.tail(30)['y']
            # Calculate trend from oldest to newest in the recent period
            trend_slope = safe_float((recent_data.iloc[-1] - recent_data.iloc[0]) / len(recent_data) if len(recent_data) > 1 else 0)
            trend_direction = "Worsening" if trend_slope > 1 else "Improving" if trend_slope < -1 else "Stable"
            
            # Calculate safe statistics
            stats = safe_series_stats(recent_data)
            
            statistics = {
                "total_records": len(aqi_df),
                "date_range": {
                    "start": aqi_df['ds'].min().strftime('%Y-%m-%d'),
                    "end": aqi_df['ds'].max().strftime('%Y-%m-%d')
                },
                "recent_30_days": {
                    "average": stats["mean"],
                    "median": stats["median"],
                    "maximum": stats["max"],
                    "minimum": stats["min"],
                    "std_dev": stats["std"],
                    "days_above_safe": int(sum(recent_data > 50)) if len(recent_data) > 0 else 0,
                    "trend_direction": trend_direction,
                    "trend_slope": trend_slope
                }
            }
            logger.info("Statistics calculated successfully")
        except Exception as e:
            logger.error(f"Error calculating statistics: {str(e)}")
            # Provide default statistics in case of error
            statistics = {
                "total_records": len(aqi_df) if 'aqi_df' in locals() else 0,
                "date_range": {
                    "start": "N/A",
                    "end": "N/A"
                },
                "recent_30_days": {
                    "average": 0.0,
                    "median": 0.0,
                    "maximum": 0.0,
                    "minimum": 0.0,
                    "std_dev": 0.0,
                    "days_above_safe": 0,
                    "trend_direction": "Unknown",
                    "trend_slope": 0.0
                }
            }
        
        # ============================
        # STEP 4: Multi-Parameter Analysis
        # ============================
        
        multi_parameter_analysis = {}
        current_concentrations = {'pm25': safe_float(aqi_df['y'].iloc[-1])}
        
        if additional_params:
            # Sort the original dataframe by date to get chronologically latest values
            df_sorted = df.sort_values(date_col).reset_index(drop=True)
            
            for param, col in additional_params.items():
                param_data = pd.to_numeric(df_sorted[col], errors='coerce')
                if not param_data.isna().all():
                    # Get the latest non-null value in chronological order
                    latest_value = safe_float(param_data.dropna().iloc[-1])
                    current_concentrations[param] = latest_value
                    avg_30_days = safe_float(param_data.tail(30).mean()) if len(param_data) >= 30 else latest_value
                    multi_parameter_analysis[param] = {
                        "latest_value": latest_value,
                        "average_30_days": avg_30_days,
                        "unit": "μg/m³" if param != 'co' else "mg/m³"
                    }
        
        # Calculate comprehensive AQI
        aqi_breakdown = calculate_detailed_aqi(current_concentrations)
        max_aqi_pollutant = max(aqi_breakdown, key=aqi_breakdown.get) if aqi_breakdown else 'pm25'
        max_aqi_value = aqi_breakdown.get(max_aqi_pollutant, predicted_aqi)
        
        # ============================
        # STEP 5: Generate 30-Day Predictions
        # ============================
        
        future_forecast = forecast.tail(30)
        predictions = []
        
        for _, row in future_forecast.iterrows():
            daily_aqi = safe_float(row['yhat'])
            daily_category, daily_color = classify_aqi(daily_aqi)
            haze_intensity = aqi_to_haze_intensity(daily_aqi)
            
            predictions.append({
                "date": row['ds'].strftime("%Y-%m-%d"),
                "predicted_aqi": daily_aqi,
                "category": daily_category,
                "color": daily_color,
                "haze_intensity": haze_intensity,
                "confidence_lower": safe_float(row['yhat_lower']),
                "confidence_upper": safe_float(row['yhat_upper'])
            })
        
        # ============================
        # STEP 6: Health Recommendations
        # ============================
        
        health_recommendations = get_detailed_health_recommendations(predicted_aqi)
        
        # ============================
        # STEP 7: Image Processing
        # ============================
        
        processed_images = {}
        gemini_prompt = ""
        
        if ref_image:
            # Save uploaded image
            img_path = f"temp/{ref_image.filename}"
            with open(img_path, "wb") as f:
                f.write(await ref_image.read())
            
            # Load and process image
            img = cv2.imread(img_path)
            if img is not None:
                haze_intensity = aqi_to_haze_intensity(predicted_aqi)

                # takes the image , applies atmospheric effects based on AQI, and returns the modified image
                smog_img = apply_atmospheric_effects(img, predicted_aqi, haze_intensity)
                
                # Save processed image
                output_path = f"outputs/smog_effect_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                cv2.imwrite(output_path, smog_img)
                
                # Convert images to base64 for response
                _, original_encoded = cv2.imencode('.jpg', img)
                _, smog_encoded = cv2.imencode('.jpg', smog_img)
                
                processed_images = {
                    "original": base64.b64encode(original_encoded).decode('utf-8'),
                    "with_smog": base64.b64encode(smog_encoded).decode('utf-8'),
                    "haze_intensity": haze_intensity
                }
                
                # Generate Gemini prompt
                gemini_prompt = (
                    f"A realistic photo showing air pollution effects with "
                    f"AQI level {int(predicted_aqi)}, {aqi_category.lower()} air quality, "
                    f"haze intensity {int(haze_intensity)}, atmospheric visibility reduced"
                )
            
            # Clean up temp file
            os.remove(img_path)
        
        # ============================
        # STEP 8: Generate Visualizations
        # ============================
        
        try:
            logger.info("Generating visualizations")
            forecast_plot = create_forecast_plot(aqi_df, forecast, predicted_aqi)
            aqi_gauge = create_aqi_gauge(predicted_aqi, aqi_category)
            logger.info("Visualizations generated successfully")
        except Exception as e:
            logger.error(f"Error generating visualizations: {str(e)}")
            # Provide empty visualizations in case of error
            forecast_plot = ""
            aqi_gauge = ""
        
        # ============================
        # STEP 9: Construct Response
        # ============================
        
        gemini_url = (
            "https://gemini.google.com/app?"
            f"&prompt={quote_plus(gemini_prompt)}"
        ) if gemini_prompt else ""
        
        response = {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "data_summary": {
                "parameters_analyzed": len(additional_params) + 1,
                "columns_detected": {
                    "date": date_col,
                    "pm25": pm25_col,
                    "additional": additional_params
                }
            },
            "current_conditions": {
                "latest_pm25": safe_float(aqi_df['y'].iloc[-1]),
                "predicted_tomorrow": safe_float(predicted_aqi),
                "category": aqi_category,
                "color": aqi_color,
                "pollutant_levels": current_concentrations
            },
            "predictions": predictions,
            "statistics": statistics,
            "multi_parameter_analysis": multi_parameter_analysis,
            "aqi_breakdown": aqi_breakdown,
            "primary_pollutant": {
                "pollutant": max_aqi_pollutant,
                "aqi_value": max_aqi_value
            },
            "health_recommendations": health_recommendations,
            "model_evaluation": model_metrics,
            "visualizations": {
                "forecast_plot": forecast_plot,
                "aqi_gauge": aqi_gauge
            },
            "processed_images": processed_images,
            "ai_generation": {
                "gemini_url": gemini_url,
                "prompt": gemini_prompt
            },
            "summary": {
                "overall_aqi": statistics["recent_30_days"]["average"],
                "overall_category": classify_aqi(statistics["recent_30_days"]["average"])[0],
                "risk_level": health_recommendations["risk_level"],
                "trend": trend_direction,
                "predicted_tomorrow": safe_float(predicted_aqi),
                "predicted_category": aqi_category,
                "primary_pollutant": {
                    "name": max_aqi_pollutant,
                    "aqi": max_aqi_value
                } if aqi_breakdown else None
            }
        }
        
        # Clean the response data to ensure no NaN/inf values
        response = clean_response_data(response)
        
        logger.info("Analysis completed successfully")
        return response
        
    except HTTPException as he:
        # Re-raise HTTP exceptions (these are expected errors)
        logger.warning(f"HTTP Exception in analysis: {he.detail}")
        raise he
    except Exception as e:
        # Log the full exception for debugging
        logger.error(f"Unexpected error in analysis: {str(e)}", exc_info=True)
        
        # Return a structured error response instead of crashing
        try:
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "timestamp": datetime.now().isoformat(),
                    "error": "Internal server error during analysis",
                    "detail": str(e),
                    "message": "The analysis could not be completed. Please check your data format and try again."
                }
            )
        except Exception as final_e:
            # Last resort - return the simplest possible error response
            logger.error(f"Failed to create error response: {str(final_e)}")
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Critical server error"}
            )

@app.post("/quick-forecast")
async def quick_forecast(dataset: UploadFile = File(...)):
    """Quick forecast endpoint for basic AQI prediction"""
    try:
        logger.info("Starting quick forecast")
        
        try:
            df = pd.read_csv(dataset.file)
            df.columns = df.columns.str.strip()
        except Exception as e:
            logger.error(f"Error reading CSV in quick-forecast: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error reading CSV file: {str(e)}"
            )
        
        date_col = find_column(df, ['date', 'datetime', 'timestamp'])
        pm25_col = find_column(df, ['pm25', 'pm2.5', 'aqi'])
        
        if not date_col or not pm25_col:
            raise HTTPException(status_code=400, detail="Required columns not found")
        
        try:
            df[date_col] = pd.to_datetime(df[date_col], dayfirst=True, errors='coerce')
            aqi_df = df[[date_col, pm25_col]].rename(columns={date_col:'ds', pm25_col:'y'})
            aqi_df['y'] = pd.to_numeric(aqi_df['y'], errors='coerce')
            aqi_df = aqi_df.dropna()
            
            # Sort by date to ensure chronological order
            aqi_df = aqi_df.sort_values('ds').reset_index(drop=True)
            
            if len(aqi_df) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="No valid data found after processing"
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing data in quick-forecast: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing data: {str(e)}"
            )
        
        try:
            model = Prophet()
            model.fit(aqi_df)
            
            future = model.make_future_dataframe(periods=7)  # 7 days for quick forecast
            forecast = model.predict(future)
            
            # Calculate basic model metrics for quick forecast
            from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
            
            historical_forecast = forecast[forecast['ds'].isin(aqi_df['ds'])]
            actual_values = aqi_df['y'].values
            predicted_values = historical_forecast['yhat'].values
            
            mae = safe_float(mean_absolute_error(actual_values, predicted_values))
            rmse = safe_float(np.sqrt(mean_squared_error(actual_values, predicted_values)))
            r2 = safe_float(r2_score(actual_values, predicted_values))
            
        except Exception as e:
            logger.error(f"Error in Prophet forecasting for quick-forecast: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error in forecasting: {str(e)}"
            )
        
        predictions = []
        for _, row in forecast.tail(7).iterrows():
            aqi_val = safe_float(row['yhat'])
            category, color = classify_aqi(aqi_val)
            predictions.append({
                "date": row['ds'].strftime("%Y-%m-%d"),
                "predicted_aqi": aqi_val,
                "category": category,
                "color": color
            })
        
        response = {
            "status": "success",
            "predictions": predictions,
            "model_metrics": {
                "mae": mae,
                "rmse": rmse,
                "r2_score": r2
            },
            "summary": {
                "next_day_aqi": predictions[0]["predicted_aqi"],
                "next_day_category": predictions[0]["category"]
            }
        }
        
        # Clean the response data to ensure no NaN/inf values
        return clean_response_data(response)
        
    except HTTPException as he:
        logger.warning(f"HTTP Exception in quick-forecast: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in quick-forecast: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": "Quick forecast failed",
                "detail": str(e)
            }
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/system-resources")
async def get_system_resources():
    """Get current system resources information"""
    try:
        disk_info = get_disk_space_info()
        memory_info = get_memory_info()
        
        # Log the request
        logger.info("System resources requested via API")
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "disk_space": disk_info,
            "memory": memory_info,
            "render_info": {
                "service_name": os.getenv('RENDER_SERVICE_NAME', 'Not available'),
                "instance_id": os.getenv('RENDER_INSTANCE_ID', 'Not available'),
                "region": os.getenv('RENDER_REGION', 'Not available')
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting system resources: {str(e)}")
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.post("/system-check")
async def trigger_system_check():
    """Manually trigger a system resource check and log the results"""
    try:
        periodic_system_check()
        return {
            "status": "success",
            "message": "System check completed and logged",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error during system check: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)