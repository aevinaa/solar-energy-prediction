from dotenv import load_dotenv
import os
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import sqlite3
import requests
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()

# -----------------------------
# MODELS
# -----------------------------

class User(BaseModel):
    name: str
    email: str
    password: str
    
class LoginUser(BaseModel):
    email: str
    password: str

class InputData(BaseModel):
    user_id: int  
    irradiation: float
    ambient_temperature: float
    module_temperature: float
    hour: int
    day: int
    month: int
    day_of_week: int
    is_daylight: int
    plant: int
    source_key: int
    prev_power: float

# NEW (IMPORTANT)
class ForecastRequest(BaseModel):
    location: str
    plant_size: float

# -----------------------------
# LOAD MODEL
# -----------------------------

model = joblib.load("solar_model.pkl")

# -----------------------------
# ROUTES
# -----------------------------

@app.get("/")
def home():
    return {"message": "SunInsight API Running 🚀"}

# -----------------------------
# PREDICT
# -----------------------------

@app.post("/predict")
def predict(data: InputData):

    input_array = np.array([[
        data.prev_power,
        data.irradiation,
        data.ambient_temperature,
        data.module_temperature,
        data.hour,
        data.day,
        data.month,
        data.day_of_week,
        data.is_daylight,
        data.plant,
        data.source_key
    ]])

    prediction = model.predict(input_array)[0]
    efficiency = prediction / (data.irradiation + 1)

    # SAVE TO DATABASE
    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO predictions (user_id, irradiation, ambient_temperature, module_temperature, hour, predicted_power)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data.user_id,
        data.irradiation,
        data.ambient_temperature,
        data.module_temperature,
        data.hour,
        float(prediction)
    ))

    conn.commit()
    conn.close()

    return {
        "predicted_power": round(float(prediction), 2),
        "efficiency": round(float(efficiency), 4)
    }

# -----------------------------
# GET PREDICTIONS
# -----------------------------

@app.get("/predictions/{user_id}")
def get_predictions(user_id: int):

    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM predictions WHERE user_id=?
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "id": row[0],
            "user_id": row[1],
            "irradiation": row[2],
            "ambient_temperature": row[3],
            "module_temperature": row[4],
            "hour": row[5],
            "predicted_power": row[6]
        })

    return {"data": results}

# -----------------------------
# SIGNUP
# -----------------------------

@app.post("/signup")
def signup(user: User):
    print(user)
    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
    """, (user.name, user.email, user.password))

    conn.commit()
    conn.close()

    return {"message": "User created successfully"}

# -----------------------------
# LOGIN
# -----------------------------

@app.post("/login")
def login(user: LoginUser):

    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM users WHERE email=? AND password=?
    """, (user.email, user.password))

    result = cursor.fetchone()
    conn.close()

    if result:
        return {"message": "Login successful", "user_id": result[0], "name": result[1], "email": result[2]}
    else:
        return {"message": "Invalid credentials"}

# -----------------------------
# FORECAST LOCATION (REAL SYSTEM)
# -----------------------------

@app.post("/forecast-location")
def forecast_location(data: ForecastRequest):

    location = data.location
    plant_size = data.plant_size

    API_KEY = os.getenv("API_KEY")

    # STEP 1: GEO API
    geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={API_KEY}"
    geo_res = requests.get(geo_url).json()

    print("GEO RESPONSE:", geo_res)

    if not isinstance(geo_res, list):
        return {"error": "Geo API failed", "details": geo_res}

    if len(geo_res) == 0:
        return {"error": "Location not found"}

    lat = geo_res[0]['lat']
    lon = geo_res[0]['lon']

    # STEP 2: WEATHER API
    weather_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}"
    weather_data = requests.get(weather_url).json()

    if "list" not in weather_data:
        return {"error": "Weather API failed", "details": weather_data}

    daily_results = {}
    prev_power = 400

    for entry in weather_data['list']:

        dt = datetime.fromtimestamp(entry['dt'])
        date_key = dt.date()

        temp = entry['main']['temp'] - 273.15
        cloud = entry['clouds']['all'] / 100
        irradiation = max((1 - cloud) * 1000, 0)

        hour = dt.hour
        day = dt.day
        month = dt.month
        day_of_week = dt.weekday()
        is_daylight = 1 if 6 <= hour <= 18 else 0

        input_array = [[
            prev_power,
            irradiation,
            temp,
            temp + 5,
            hour,
            day,
            month,
            day_of_week,
            is_daylight,
            1,
            5
        ]]

        prediction = model.predict(input_array)[0]

        # NIGHT FIX
        if is_daylight == 0:
            prediction = 0

        # Safety
        if prediction is None or np.isnan(prediction):
            prediction = 0

        scaled_power = prediction * (plant_size / 5)

        if scaled_power is None or np.isnan(scaled_power):
            scaled_power = 0

        if date_key not in daily_results:
            daily_results[date_key] = scaled_power
        else:
            daily_results[date_key] = max(daily_results[date_key], scaled_power)

        prev_power = prediction

    results = []
    for date, power in daily_results.items():
        results.append({
            "date": str(date),
            "predicted_power": round(float(power), 2)
        })
    
    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO forecasts (user_id, location, date, predicted_power)
    VALUES (?, ?, ?, ?)
    """, (
        1,  # temporary user_id or from auth
        location,
        str(date_key),
        float(scaled_power)
    ))

    conn.commit()
    conn.close()
    return {"forecast": results}

@app.get("/forecasts/{user_id}")
def get_forecasts(user_id: int):

    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT location, date, predicted_power 
    FROM forecasts 
    WHERE user_id=?
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "location": row[0],
            "date": row[1],
            "predicted_power": row[2]
        })

    return {"data": results}

