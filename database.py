import sqlite3

conn = sqlite3.connect("solar.db")
cursor = conn.cursor()

# USERS TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT, 
    password TEXT
)
""")

# PREDICTIONS TABLE (linked to user)
cursor.execute("""
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    irradiation REAL,
    ambient_temperature REAL,
    module_temperature REAL,
    hour INTEGER,
    predicted_power REAL
)
""")

#FORECASTS TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    location TEXT,
    date TEXT,
    predicted_power REAL
)
""")

conn.commit()
conn.close()

print("Database updated!")