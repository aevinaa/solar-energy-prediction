# ☀️ SunSight – Solar Energy Prediction Platform

SunSight is a full-stack web application that predicts solar energy generation using machine learning and real-time weather data.

Built with ❤️ using FastAPI, React, and modern deployment tools.

---

## 🚀 Live Demo

- 🌐 Frontend: [https://your-vercel-link.vercel.app](https://solar-energy-prediction-psi.vercel.app/)
- ⚙️ Backend API: [https://solar-energy-prediction-ny8f.onrender.com/](https://solar-energy-prediction-ny8f.onrender.com/)

---

## ✨ Features

- 🔐 User Authentication (Signup/Login)
- 📊 Solar Energy Prediction (ML-based)
- 🌦️ 5-Day Forecast using live weather data
- 📁 User-specific prediction history
- ⚡ Fast and responsive UI
- ☁️ Fully deployed (Vercel + Render)

---

## 🧠 Tech Stack

Frontend

- React.js
- Tailwind CSS
- Vite

Backend

- FastAPI
- SQLite
- Uvicorn

Machine Learning

- Scikit-learn
- NumPy
- Joblib
- XGBoost

Deployment

- Vercel (Frontend)
- Render (Backend)

---

## 📂 Project Structure

solar-energy-prediction/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── solar.db
│   └── model.pkl
│
├── frontend/
│   ├── src/
│   ├── pages/
│   └── components/
│
└── README.md

---

## ⚙️ Installation & Setup

1️⃣ Clone the repository

git clone https://github.com/aevinaa/solar-energy-prediction.git
cd solar-energy-prediction

---

2️⃣ Backend Setup

cd backend
pip install -r requirements.txt
uvicorn app:app --reload

---

3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

---

## 🔗 API Endpoints

Method| Endpoint| Description
POST| /signup| Register user
POST| /login| Login user
POST| /predict| Generate prediction
POST| /forecast| 5-day forecast

---

## 🧩 Environment Variables

Frontend (.env)

VITE_API_URL=[https://your-render-link.onrender.com](https://solar-energy-prediction-ny8f.onrender.com/)

---

## 🐞 Challenges Faced

- Deployment issues with missing dependencies (joblib, xgboost)
- CORS errors between frontend and backend
- Database initialization errors (missing tables)
- HTTPS vs HTTP conflicts

---

## 📈 Future Improvements

- 🌍 Add map-based location selection
- 📊 Better visualization (charts)
- 🔐 JWT authentication
- ☁️ Cloud database (PostgreSQL)
