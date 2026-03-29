import requests

url = "http://127.0.0.1:5000/predict"

data = {
    "irradiation": 800,
    "temperature": 30,
    "module_temp": 35,
    "hour": 12
}

response = requests.post(url, json=data)
print(response.json())
