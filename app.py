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
    allow_origins=["https://solar-energy-prediction-psi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "solar.db")

def init_db():
    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT UNIQUE, password TEXT)""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, irradiation REAL, ambient_temperature REAL,
        module_temperature REAL, hour INTEGER, predicted_power REAL, date TEXT)""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS forecasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, location TEXT, date TEXT, predicted_power REAL)""")
    conn.commit()
    conn.close()

init_db()

# ─────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────

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
    plant_size: float          # used only for efficiency calculation

class ForecastRequest(BaseModel):
    user_id: int
    location: str
    plant_size: float

# ─────────────────────────────────────────
# LOAD MODEL
# ─────────────────────────────────────────

model = joblib.load("solar_model.pkl")

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "SunInsight API Running 🚀"}

# ─────────────────────────────────────────
# PREDICT (INSTANT)
# ─────────────────────────────────────────

@app.post("/predict")
def predict(data: InputData):
    """
    Instant prediction based on current sensor readings.

    The model was trained on NORMALISED values (0-1 fraction of plant peak).
    So we must:
      1. Normalise prev_power  →  prev_power / plant_size
      2. Feed to model         →  get a 0-1 fraction back
      3. Denormalise output    →  fraction × plant_size  →  kW

    Efficiency = predicted_kW / (plant_size × irradiance_fraction)
    """

    plant_size = data.plant_size if data.plant_size > 0 else 1.0

    # Normalise prev_power to 0-1 fraction
    prev_power_norm = data.prev_power / plant_size

    # Feature order must exactly match training
    input_array = np.array([[
        prev_power_norm,              # 0-1 fraction
        data.irradiation,             # W/m²
        data.ambient_temperature,     # °C
        data.module_temperature,      # °C
        data.hour,
        data.day,
        data.month,
        data.day_of_week,
        data.is_daylight,
        data.plant,
        data.source_key,
    ]])

    print(f"Predict input: {input_array}")

    # Model outputs a 0-1 fraction of plant peak
    norm_output = float(model.predict(input_array)[0])

    # Clamp fraction to valid range before denormalising
    norm_output = max(0.0, min(norm_output, 1.0))

    # Denormalise → actual kW
    prediction = norm_output * plant_size

    # Efficiency: actual output vs theoretical max at this irradiance
    if data.irradiation > 0:
        theoretical_max = plant_size * (data.irradiation / 1000.0)
        efficiency = prediction / theoretical_max
        efficiency = max(0.0, min(efficiency, 1.0))
    else:
        efficiency = 0.0

    print(f"norm_output={norm_output:.4f} | Prediction={prediction:.2f} kW | Efficiency={efficiency:.4f}")

    # Save instant prediction to DB so it appears in history
    today = datetime.now().strftime("%Y-%m-%d")
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO predictions
               (user_id, irradiation, ambient_temperature, module_temperature,
                hour, predicted_power, date)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data.user_id, data.irradiation, data.ambient_temperature,
             data.module_temperature, data.hour, round(prediction, 2), today),
        )
        conn.commit()

    return {
        "predicted_power": round(prediction, 2),
        "efficiency":      round(efficiency, 4),
    }

# ─────────────────────────────────────────
# GET HISTORY
# ─────────────────────────────────────────

@app.get("/predictions/{user_id}")
def get_predictions(user_id: int):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        # Most recent first
        cursor.execute(
            "SELECT * FROM predictions WHERE user_id=? ORDER BY id DESC",
            (user_id,)
        )
        rows = cursor.fetchall()

    results = []
    for row in rows:
        irr  = float(row[2]) if row[2] is not None else None
        temp = float(row[3]) if row[3] is not None else None
        hour = row[5]
        power = float(row[6]) if row[6] is not None else None

        # Forecast entries are saved with hour=12 and have large daily kWh values.
        # Instant entries are saved with the actual hour and smaller kW values.
        # We use hour=12 as the signal for forecast type.
        is_forecast = (hour == 12)

        results.append({
            "id":                  int(row[0]),
            "irradiation":         irr,
            "ambient_temperature": temp,
            "predicted_power":     power,
            "hour":                int(hour) if hour is not None else None,
            "date":                row[7],
            "type":                "forecast" if is_forecast else "instant",
        })

    return {"data": results}

# ─────────────────────────────────────────
# SIGNUP
# ─────────────────────────────────────────

@app.post("/signup")
def signup(user: User):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                (user.name, user.email, user.password),
            )
        return {"message": "User created successfully"}
    except sqlite3.IntegrityError:
        return {"detail": "Email already exists"}

# ─────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────

@app.post("/login")
def login(user: LoginUser):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE email=? AND password=?",
            (user.email, user.password),
        )
        result = cursor.fetchone()

    if result:
        return {
            "message": "Login successful",
            "user_id": result[0],
            "name":    result[1],
            "email":   result[2],
        }
    return {"detail": "Invalid credentials"}

# ─────────────────────────────────────────
# FORECAST (5-DAY DAILY TOTALS)
# ─────────────────────────────────────────

@app.post("/forecast-location")
def forecast_location(data: ForecastRequest):
    """
    Generate 5-day solar energy forecast from location + plant size.

    Approach:
      1. Geocode location → lat/lon
      2. Fetch 3-hourly weather forecast (OpenWeatherMap free tier = 40 slots ≈ 5 days)
      3. Run ML model per slot → raw kW prediction
      4. kWh per slot = predicted_kW × 3 hours (each slot covers 3 h)
      5. Sum daily kWh per calendar day
      6. Store & return
    """

    API_KEY = os.getenv("API_KEY")

    # ── 1. Geocode ──────────────────────────────────────────────────────────
    geo_url = (
        f"https://api.openweathermap.org/geo/1.0/direct"
        f"?q={data.location}&limit=1&appid={API_KEY}"
    )
    geo_res = requests.get(geo_url).json()

    if not isinstance(geo_res, list) or len(geo_res) == 0:
        return {"error": "Invalid location"}

    lat = geo_res[0]['lat']
    lon = geo_res[0]['lon']

    # ── 2. Fetch weather ─────────────────────────────────────────────────────
    weather_url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={API_KEY}"
    )
    weather_data = requests.get(weather_url).json()

    if "list" not in weather_data:
        return {"error": "Weather API failed", "details": weather_data}

    # ── 3. Process each 3-hour slot ─────────────────────────────────────────
    daily_kwh: dict = {}
    daily_meta: dict = {}
    prev_power = 0.0

    for entry in weather_data['list']:
        dt   = datetime.fromtimestamp(entry['dt'])
        date = dt.date()

        temp_c     = entry['main']['temp'] - 273.15
        cloud_frac = entry['clouds']['all'] / 100.0
        hour       = dt.hour

        # ── Solar elevation factor ───────────────────────────────────────────
        # The sun follows a bell curve through the day.
        # At solar noon (~12:00) the elevation is highest → max irradiance.
        # At 6am/6pm the sun is near the horizon → very little irradiance.
        # We model this with a sine curve that peaks at noon and is 0
        # before 6am and after 18:00 (the typical daylight window).
        #
        # Formula:  elevation_factor = sin(π × (hour - 6) / 12)
        #   hour=6  → sin(0)    = 0.00  (sunrise, grazing angle)
        #   hour=9  → sin(π/4)  = 0.71  (morning)
        #   hour=12 → sin(π/2)  = 1.00  (solar noon, peak)
        #   hour=15 → sin(3π/4) = 0.71  (afternoon)
        #   hour=18 → sin(π)    = 0.00  (sunset)
        #
        if 6 < hour < 18:
            elevation_factor = max(0.0, np.sin(np.pi * (hour - 6) / 12))
        else:
            elevation_factor = 0.0

        is_daylight = 1 if elevation_factor > 0 else 0

        # Clear-sky irradiance scaled by sun angle, then reduced by cloud cover
        clear_sky   = 1000.0 * elevation_factor
        irradiation = max(0.0, clear_sky * (1.0 - cloud_frac))

        # Normalise prev_power to match training (0-1 fraction)
        prev_power_norm = prev_power / data.plant_size if data.plant_size > 0 else 0.0

        # Feature vector — same order as training
        input_array = np.array([[
            prev_power_norm,   # 0-1 fraction
            irradiation,
            temp_c,
            temp_c + 5.0,
            hour,
            dt.day,
            dt.month,
            dt.weekday(),
            is_daylight,
            1,
            5,
        ]])

        # Model outputs 0-1 fraction → denormalise to kW
        norm_output = float(model.predict(input_array)[0])
        norm_output = max(0.0, min(norm_output, 1.0))   # clamp fraction
        raw_kw      = norm_output * data.plant_size

        # Each slot is 3 hours → energy in kWh
        slot_kwh = raw_kw * 3.0

        # Accumulate
        if date not in daily_kwh:
            daily_kwh[date]  = 0.0
            daily_meta[date] = {"temps": [], "irrs": []}

        daily_kwh[date]              += slot_kwh
        daily_meta[date]["temps"].append(temp_c)
        daily_meta[date]["irrs"].append(irradiation)

        prev_power = raw_kw

    # ── 4. Store & return ────────────────────────────────────────────────────
    results = []

    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        cursor = conn.cursor()

        for date, kwh in daily_kwh.items():
            meta     = daily_meta[date]
            avg_temp = float(sum(meta["temps"]) / len(meta["temps"]))
            avg_irr  = float(sum(meta["irrs"])  / len(meta["irrs"]))

            results.append({
                "date":            str(date),
                "predicted_power": round(kwh, 2),   # kWh for the day
                "avg_temp":        round(avg_temp, 2),
                "avg_irradiation": round(avg_irr, 2),
            })

            cursor.execute(
                """INSERT INTO predictions
                   (user_id, irradiation, ambient_temperature, module_temperature,
                    hour, predicted_power, date)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (data.user_id, avg_irr, avg_temp, avg_temp + 5, 12, kwh, str(date)),
            )

        conn.commit()

    return {"forecast": results}
