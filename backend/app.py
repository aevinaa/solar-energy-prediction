from flask import Flask, request, jsonify
import pandas as pd
import pickle
import sqlite3

def init_db():
    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            irradiation REAL,
            temperature REAL,
            module_temp REAL,
            hour INTEGER,
            prediction REAL
        )
    """)

    conn.commit()
    conn.close()

init_db()

def save_to_db(data, prediction):
    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO predictions 
        (irradiation, temperature, module_temp, hour, prediction)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["irradiation"],
        data["temperature"],
        data["module_temp"],
        data["hour"],
        prediction
    ))

    conn.commit()
    conn.close()

app = Flask(__name__)

# Load model
model = pickle.load(open("solar_model.pkl", "rb"))

@app.route('/')
def home():
    return "API is running"

@app.route('/predict', methods=['POST'])

@app.route('/history', methods=['GET'])
def history():
    conn = sqlite3.connect("solar.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM predictions")
    rows = cursor.fetchall()

    conn.close()

    return jsonify(rows)
def predict():
    data = request.json

    new_data = pd.DataFrame({
        "IRRADIATION": [data["irradiation"]],
        "AMBIENT_TEMPERATURE": [data["temperature"]],
        "MODULE_TEMPERATURE": [data["module_temp"]],
        "hour": [data["hour"]]
    })

    prediction = model.predict(new_data)[0]
    save_to_db(data, prediction)

    return jsonify({
        "prediction": float(prediction)
    })

if __name__ == "__main__":
    app.run(debug=True)