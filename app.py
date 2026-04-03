from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import sqlite3

app = FastAPI()

class User(BaseModel):
    username: str
    password: str

# Load model
model = joblib.load("solar_model.pkl")

# Input schema
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

@app.get("/")
def home():
    return {"message": "SunInsight API Running 🚀"}

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
            "temperature": row[3],
            "predicted_power": row[4]
        })

    return {"data": results}

@app.post("/signup")
def signup(user: User):

    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO users (username, password)
    VALUES (?, ?)
    """, (user.username, user.password))

    conn.commit()
    conn.close()

    return {"message": "User created successfully"}

@app.post("/login")
def login(user: User):

    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM users WHERE username=? AND password=?
    """, (user.username, user.password))

    result = cursor.fetchone()

    conn.close()

    if result:
        return {"message": "Login successful", "user_id": result[0]}
    else:
        return {"message": "Invalid credentials"}