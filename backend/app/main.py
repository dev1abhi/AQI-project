from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
import numpy as np
import cv2
from prophet import Prophet
import matplotlib.pyplot as plt
import os



app = FastAPI()

origins = [
    "http://localhost:5173",   #for local dev
    "https://aqi-app-frontend.onrender.com",   #for deployed frontend
    "*",  #allow all origins
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, etc.
    allow_headers=["*"],
)

# Utility: AQI → haze intensity
def aqi_to_haze(aqi):
    if aqi <= 50: return 0
    elif aqi <= 100: return 25
    elif aqi <= 200: return 60
    elif aqi <= 300: return 100
    elif aqi <= 400: return 140
    else: return 180

@app.post("/process")
async def process_file(dataset: UploadFile = File(...), ref_image: UploadFile = File(...)):
    try:
        # --- Step 1: Load dataset ---
        df = pd.read_csv(dataset.file)
        df.columns = df.columns.str.strip()
        df['date'] = pd.to_datetime(df['date'], dayfirst=True, errors='coerce')
        df = df.dropna(subset=['date'])

        # Prophet requires ds, y
        aqi_df = df[['date', 'pm25']].rename(columns={'date':'ds', 'pm25':'y'})
        aqi_df['y'] = pd.to_numeric(aqi_df['y'], errors='coerce')
        aqi_df = aqi_df.dropna(subset=['ds','y'])

        # --- Step 2: Forecast ---
        model = Prophet()
        model.fit(aqi_df)
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)

        # Keep only the last 30 days
        future_forecast = forecast.tail(30)
        predictions = []
        for _, row in future_forecast.iterrows():
            predicted_aqi = row['yhat']
            haze_intensity = aqi_to_haze(predicted_aqi)
            predictions.append({
                "date": row['ds'].strftime("%Y-%m-%d"),
                "predicted_aqi": float(predicted_aqi),
                "haze_intensity": int(haze_intensity)
            })

        # --- Step 3: Apply haze overlay on reference image ---
        ref_img_path = f"temp_{ref_image.filename}"
        with open(ref_img_path, "wb") as f:
            f.write(await ref_image.read())

        img = cv2.imread(ref_img_path)
        last_day_aqi = predictions[-1]['predicted_aqi']
        last_day_haze = predictions[-1]['haze_intensity']

        haze = np.full(img.shape, (255, 255, 255), dtype=np.uint8)
        overlay = img.copy()
        cv2.addWeighted(haze, last_day_haze/255, img, 1 - last_day_haze/255, 0, overlay)

        out_path = "output.jpg"
        cv2.imwrite(out_path, overlay)

        # --- Step 4: Construct Gemini URL ---
        prompt = (
            f"A realistic photo of Delhi's India Gate covered in smog, "
            f"air pollution level AQI {int(last_day_aqi)}, "
            f"haze intensity {int(last_day_haze)}"
        )
        from urllib.parse import quote_plus
        gemini_url = (
            "https://gemini.google.com/app?"
            "&android-min-version=301356232"
            "&ios-min-version=322.0"
            "&is_sa=1"
            "&campaign_id=gemini_overview_page"
            "&utm_source=gemini"
            "&utm_medium=web"
            "&utm_campaign=gemini_overview_page"
            "&pt=9008"
            "&mt=8"
            "&ct=gemini_overview_page"
            "&hl=en-IN"
            f"&prompt={quote_plus(prompt)}"
        )

        return {
            "predictions": predictions,  # full 30-day forecast
            "image_url": gemini_url,
            "prompt": prompt
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/download")
async def download_file():
    return FileResponse("output.jpg", media_type="image/jpeg", filename="output.jpg")
