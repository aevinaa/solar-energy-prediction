import sqlite3

conn = sqlite3.connect("solar.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM predictions")

rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()