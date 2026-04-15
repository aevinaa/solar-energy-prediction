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
    allow_origins=["https://solar-energy-prediction-git-main-aevinaas-projects.vercel.app"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "solar.db")

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

class ForecastRequest(BaseModel):
    user_id: int
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
# PREDICT (INSTANT)
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

    if prediction < 0:
        prediction = 0

    efficiency = prediction / (data.irradiation + 1)

    with sqlite3.connect(DB_PATH, timeout=10) as conn:
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

    return {
        "predicted_power": round(float(prediction), 2),
        "efficiency": round(float(efficiency), 4)
    }

# -----------------------------
# GET HISTORY
# -----------------------------

@app.get("/predictions/{user_id}")
def get_predictions(user_id: int):

    with sqlite3.connect("solar.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM predictions WHERE user_id=?", (user_id,))
        rows = cursor.fetchall()

    results = []
    for row in rows:
        results.append({
            "id": int(row[0]),
            "avg_irradiation": float(row[2]) if row[2] is not None else None,
            "avg_temp": float(row[3]) if row[3] is not None else None,
            "predicted_power": float(row[6]) if row[6] is not None else None,
            "date": row[7]
        })

    return {"data": results}

# -----------------------------
# SIGNUP
# -----------------------------

@app.post("/signup")
def signup(user: User):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
        """, (user.name, user.email, user.password))

    return {"message": "User created successfully"}

# -----------------------------
# LOGIN
# -----------------------------

@app.post("/login")
def login(user: LoginUser):

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM users WHERE email=? AND password=?
        """, (user.email, user.password))

        result = cursor.fetchone()

    if result:
        return {
            "message": "Login successful",
            "user_id": result[0],
            "name": result[1],
            "email": result[2]
        }
    else:
        return {"message": "Invalid credentials"}

# -----------------------------
# FORECAST (DAILY TOTAL)
# -----------------------------

@app.post("/forecast-location")
def forecast_location(data: ForecastRequest):

    API_KEY = os.getenv("API_KEY")

    # GEO API
    geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={data.location}&limit=1&appid={API_KEY}"
    geo_res = requests.get(geo_url).json()

    if not isinstance(geo_res, list) or len(geo_res) == 0:
        return {"error": "Invalid location"}

    lat = geo_res[0]['lat']
    lon = geo_res[0]['lon']

    # WEATHER API
    weather_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}"
    weather_data = requests.get(weather_url).json()

    if "list" not in weather_data:
        return {"error": "Weather API failed", "details": weather_data}

    daily_data = {}
    prev_power = 400

    for entry in weather_data['list']:

        dt = datetime.fromtimestamp(entry['dt'])
        date = dt.date()

        temp = entry['main']['temp'] - 273.15
        cloud = entry['clouds']['all'] / 100
        irradiation = max((1 - cloud) * 1000, 0)

        hour = dt.hour
        is_daylight = 1 if 6 <= hour <= 18 else 0

        input_array = [[
            prev_power,
            irradiation,
            temp,
            temp + 5,
            hour,
            dt.day,
            dt.month,
            dt.weekday(),
            is_daylight,
            1,
            5
        ]]

        prediction = model.predict(input_array)[0]

        if prediction < 0 or is_daylight == 0:
            prediction = 0

        scaled_power = prediction * (data.plant_size / 5)

        if scaled_power < 0:
            scaled_power = 0

        if date not in daily_data:
            daily_data[date] = {
                "power": [],
                "temp": [],
                "irradiation": []
            }

        daily_data[date]["power"].append(float(scaled_power))
        daily_data[date]["temp"].append(float(temp))
        daily_data[date]["irradiation"].append(float(irradiation))

        prev_power = prediction

    results = []

    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        cursor = conn.cursor()

        for date, values in daily_data.items():

            daily_total = float(sum(values["power"]))
            avg_temp = float(sum(values["temp"]) / len(values["temp"]))
            avg_irr = float(sum(values["irradiation"]) / len(values["irradiation"]))

            results.append({
                "date": str(date),
                "predicted_power": round(daily_total, 2),
                "avg_temp": round(avg_temp, 2),
                "avg_irradiation": round(avg_irr, 2)
            })
            cursor.execute("""
                INSERT INTO predictions 
                (user_id, irradiation, ambient_temperature, module_temperature, hour, predicted_power, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (data.user_id, avg_irr, avg_temp, avg_temp + 5, 0, daily_total, str(date)
            ))

    return {"forecast": results}
