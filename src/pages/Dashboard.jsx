/**
 * Dashboard.jsx — MERGED VERSION
 *
 * Keeps:
 *  ✅ Teammate's real API calls (/predict and /forecast-location)
 *  ✅ Teammate's prediction/efficiency/forecastData states
 *  ✅ Teammate's results display (predicted power, efficiency, forecast)
 *  ✅ Our shared Navbar component (removed duplicate inline navbar)
 *  ✅ Our UI/UX design
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun, Zap, BarChart2, ArrowRight,
  MapPin, Activity, X, Thermometer, Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";

const C = {
  bg:          "#0A0A07",
  card:        "#131310",
  cardHover:   "#1C1C16",
  amber:       "#F5A623",
  amberLight:  "#FFD07A",
  orange:      "#FF6835",
  cream:       "#F0ECD8",
  muted:       "#A89F88",
  mutedDark:   "#6E6A5A",
  border:      "rgba(245,166,35,0.12)",
  borderHover: "rgba(245,166,35,0.30)",
  green:       "#6dbf7e",
};

const isFirstVisit = () => !localStorage.getItem("si_visited");
const markVisited  = ()  =>  localStorage.setItem("si_visited", "1");

export default function Dashboard() {
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────
  const [firstTime,  setFirstTime]  = useState(isFirstVisit());
  const [mode,       setMode]       = useState(null);
  const [submitted,  setSubmitted]  = useState(false);

  // ── Teammate's result states (from API responses) ─────────
  const [prediction,   setPrediction]   = useState(null);
  const [efficiency,   setEfficiency]   = useState(null);
  const [forecastData, setForecastData] = useState(null);

  // ── User info from localStorage ───────────────────────────
  const name     = localStorage.getItem("name")  || "User";
  const userName = name.split(" ")[0];

  // ── Form state ────────────────────────────────────────────
  const [instantForm, setInstantForm] = useState({
    radiation:"", temperature:"", time:"", previousPower:"",
  });
  const [forecastForm, setForecastForm] = useState({
    location:"", plantSize:"",
  });

  // ── Helpers ───────────────────────────────────────────────
  const selectMode = (m) => {
    setMode(m);
    setSubmitted(false);
    setPrediction(null);
    setEfficiency(null);
    setForecastData(null);
    if (firstTime) { markVisited(); setFirstTime(false); }
  };

  // ── Submit — KEEPS TEAMMATE'S REAL API CALLS ──────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED — Mode:", mode);

    try {
      if (mode === "instant") {
        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id:             parseInt(localStorage.getItem("user_id")) || 1,
            irradiation:         parseFloat(instantForm.radiation),
            ambient_temperature: parseFloat(instantForm.temperature),
            module_temperature:  parseFloat(instantForm.temperature) + 5,
            hour:                parseInt(instantForm.time.split(":")[0]),
            day:                 15,
            month:               5,
            day_of_week:         2,
            is_daylight:         1,
            plant:               1,
            source_key:          5,
            prev_power:          parseFloat(instantForm.previousPower),
          }),
        });
        const data = await response.json();
        setPrediction(data.predicted_power);
        setEfficiency(data.efficiency);
      }

      if (mode === "forecast") {
        const response = await fetch("http://127.0.0.1:8000/forecast-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location:   forecastForm.location,
            plant_size: parseFloat(forecastForm.plantSize),
          }),
        });
        const data = await response.json();
        console.log("Forecast response:", data);
        setForecastData(data.forecast);
      }

      setSubmitted(true);

    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong connecting to the backend. Make sure it's running.");
    }
  };

  const reset = () => {
    setMode(null);
    setSubmitted(false);
    setPrediction(null);
    setEfficiency(null);
    setForecastData(null);
    setInstantForm({ radiation:"", temperature:"", time:"", previousPower:"" });
    setForecastForm({ location:"", plantSize:"" });
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.cream, fontFamily:"'Outfit',sans-serif", position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes fade-up    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes grid-drift { 0%,100% { opacity:0.18; } 50% { opacity:0.32; } }
        @keyframes pulse-soft { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0.9; transform:scale(1.04); } }

        .dot-grid {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:radial-gradient(rgba(245,166,35,0.10) 1px, transparent 1px);
          background-size:36px 36px;
          mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }
        .dash-input {
          width:100%; background:rgba(255,255,255,0.04);
          border:1px solid rgba(245,166,35,0.18); border-radius:12px;
          padding:13px 16px; color:${C.cream};
          font-family:'Outfit',sans-serif; font-size:15px; outline:none;
          transition:border-color 0.22s, background 0.22s;
        }
        .dash-input::placeholder { color:${C.mutedDark}; }
        .dash-input:focus { border-color:rgba(245,166,35,0.55); background:rgba(245,166,35,0.04); }

        .dash-btn {
          background:${C.amber}; color:${C.bg}; border:none;
          border-radius:12px; padding:14px 32px;
          font-family:'Outfit',sans-serif; font-size:15px; font-weight:700;
          cursor:pointer; display:inline-flex; align-items:center; gap:8px;
          transition:all 0.22s;
        }
        .dash-btn:hover { background:${C.amberLight}; transform:translateY(-2px); }

        .mode-card {
          flex:1; background:${C.card}; border:1px solid ${C.border};
          border-radius:22px; padding:36px; cursor:pointer;
          transition:all 0.28s; position:relative; overflow:hidden; min-width:240px;
        }
        .mode-card:hover, .mode-card.selected {
          background:${C.cardHover}; border-color:${C.borderHover};
          transform:translateY(-4px); box-shadow:0 0 32px rgba(245,166,35,0.10);
        }
        .mode-card.selected { border-color:${C.amber}; }

        .stat-pill {
          display:flex; align-items:center; gap:10px;
          background:rgba(245,166,35,0.05); border:1px solid ${C.border};
          border-radius:12px; padding:10px 16px; transition:border-color 0.2s;
        }
        .stat-pill:hover { border-color:${C.borderHover}; }

        /* Forecast table rows */
        .forecast-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:12px 16px; border-radius:10px;
          border:1px solid ${C.border};
          background:rgba(245,166,35,0.03);
          transition:background 0.2s;
        }
        .forecast-row:hover { background:rgba(245,166,35,0.07); }

        .input-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        @media(max-width:540px) { .input-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* ── Background decorations ── */}
      <div className="dot-grid" />
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-5%", left:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,104,53,0.05) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", top:"8%", right:"3%", pointerEvents:"none", zIndex:0, opacity:0.7 }}>
        {[60,100,140,180].map((r,i) => (
          <div key={r} style={{ position:"absolute", top:"50%", left:"50%", width:r*2, height:r*2, transform:"translate(-50%,-50%)", borderRadius:"50%", border:`1px solid rgba(245,166,35,${0.10-i*0.018})`, animation:`grid-drift ${3+i*0.8}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
        ))}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:28, height:28, borderRadius:"50%", background:"radial-gradient(circle at 40% 35%, #FFD966, #F5A623 55%, #D4631A)", boxShadow:"0 0 24px rgba(245,166,35,0.5)", animation:"pulse-soft 4s ease-in-out infinite" }} />
      </div>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        {[15,35,55,75].map((pct,i) => (
          <div key={i} style={{ position:"absolute", top:0, left:`${pct}%`, width:1, height:"100%", background:`linear-gradient(180deg, transparent, rgba(245,166,35,${0.04-i*0.005}), transparent)` }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* Shared Navbar — handles navigation + profile dropdown */}
        <Navbar />

        <main style={{ padding:"60px 5%", maxWidth:1100, margin:"0 auto" }}>

          {/* ── Greeting ── */}
          <div style={{ marginBottom:"48px", animation:"fade-up 0.6s ease-out both" }}>
            <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.22)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"6px 14px", borderRadius:"100px", marginBottom:"16px" }}>
              {firstTime ? "Welcome to SunInsight" : "Welcome back"}
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(28px,4vw,52px)", lineHeight:1.08, marginBottom:"14px" }}>
              {firstTime
                ? <>{`Let's get you started,`}<br /><span style={{ color:C.amber }}>{userName}.</span></>
                : <>Your predictions,<br /><span style={{ color:C.amber }}>{userName}.</span></>
              }
            </h1>
            <p style={{ color:C.muted, fontSize:"16px", maxWidth:480, lineHeight:1.75 }}>
              {firstTime ? "Choose a prediction mode below to get started." : "Run a new prediction or pick up where you left off."}
            </p>
          </div>

          {/* ── Status pills ── */}
          <div style={{ display:"flex", gap:"14px", marginBottom:"52px", flexWrap:"wrap", animation:"fade-up 0.6s 0.1s ease-out both" }}>
            {[
              { label:"Model",  value:"Active",    color:C.green },
              { label:"Mode",   value: mode ? (mode==="instant" ? "Instant" : "5-Day Forecast") : "Not selected", color:C.amber },
              { label:"Status", value: submitted ? "Submitted" : "Ready", color: submitted ? C.green : C.muted },
            ].map(s => (
              <div key={s.label} className="stat-pill">
                <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, boxShadow:`0 0 7px ${s.color}`, flexShrink:0 }} />
                <span style={{ fontSize:"13px", color:C.muted }}>{s.label}:</span>
                <span style={{ fontSize:"13px", fontWeight:600, color:s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* ── Mode selection + form ── */}
          {!submitted && (
            <>
              <div style={{ marginBottom:"24px" }}>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", marginBottom:"6px" }}>Select a prediction mode</h2>
                <p style={{ color:C.muted, fontSize:"14px" }}>Pick one — you can switch anytime.</p>
              </div>

              <div style={{ display:"flex", gap:"18px", marginBottom:"36px", flexWrap:"wrap" }}>

                {/* Mode 1 */}
                <div className={`mode-card${mode==="instant"?" selected":""}`} onClick={() => selectMode("instant")}>
                  {mode==="instant" && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"55%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />}
                  <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.08)`, pointerEvents:"none" }} />
                  <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.06)`, pointerEvents:"none" }} />
                  <div style={{ width:52, height:52, borderRadius:"14px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px" }}>
                    <Activity size={24} color={C.amber} />
                  </div>
                  <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.2)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:"100px", marginBottom:"14px" }}>Mode 1</div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"19px", marginBottom:"10px", color:C.cream }}>Instant Prediction</h3>
                  <p style={{ color:C.muted, fontSize:"14px", lineHeight:1.75 }}>Enter radiation, temperature, time and previous power. Get a predicted output for that exact moment — no weather API used.</p>
                  <div style={{ marginTop:"20px", fontSize:"13px", fontWeight:600, color:C.amber }}>{mode==="instant" ? "Selected ✓" : "Select →"}</div>
                </div>

                {/* Mode 2 */}
                <div className={`mode-card${mode==="forecast"?" selected":""}`} onClick={() => selectMode("forecast")}>
                  {mode==="forecast" && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"55%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />}
                  <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.08)`, pointerEvents:"none" }} />
                  <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.06)`, pointerEvents:"none" }} />
                  <div style={{ width:52, height:52, borderRadius:"14px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px" }}>
                    <BarChart2 size={24} color={C.amber} />
                  </div>
                  <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.2)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:"100px", marginBottom:"14px" }}>Mode 2</div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"19px", marginBottom:"10px", color:C.cream }}>5-Day Forecast</h3>
                  <p style={{ color:C.muted, fontSize:"14px", lineHeight:1.75 }}>Enter your location and plant size. We fetch live weather data and predict solar generation for the next 5 days.</p>
                  <div style={{ marginTop:"20px", fontSize:"13px", fontWeight:600, color:C.amber }}>{mode==="forecast" ? "Selected ✓" : "Select →"}</div>
                </div>

              </div>

              {/* ── Input form ── */}
              {mode && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"22px", padding:"40px", animation:"fade-up 0.4s ease-out both", maxWidth:600, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", bottom:-60, right:-60, width:200, height:200, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.07)`, pointerEvents:"none" }} />
                  <div style={{ position:"absolute", bottom:-30, right:-30, width:130, height:130, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.05)`, pointerEvents:"none" }} />
                  <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"40%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"20px" }}>
                      {mode==="instant" ? "Instant Prediction" : "5-Day Forecast"}
                    </h3>
                    <button onClick={reset} style={{ background:"none", border:"none", cursor:"pointer", color:C.mutedDark, display:"flex", alignItems:"center", gap:"5px", fontSize:"13px", fontFamily:"'Outfit',sans-serif" }}>
                      <X size={14} /> Change mode
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

                    {/* Mode 1 inputs */}
                    {mode === "instant" && (
                      <>
                        <div className="input-grid">
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Solar Radiation (W/m²)</label>
                            <div style={{ position:"relative" }}>
                              <Sun size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" step="0.01" placeholder="e.g. 850.5" value={instantForm.radiation} onChange={e => setInstantForm(p=>({...p,radiation:e.target.value}))} required />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Temperature (°C)</label>
                            <div style={{ position:"relative" }}>
                              <Thermometer size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" step="0.1" placeholder="e.g. 32.5" value={instantForm.temperature} onChange={e => setInstantForm(p=>({...p,temperature:e.target.value}))} required />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Time</label>
                            <div style={{ position:"relative" }}>
                              <Clock size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="time" value={instantForm.time} onChange={e => setInstantForm(p=>({...p,time:e.target.value}))} required />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Previous Power (kW)</label>
                            <div style={{ position:"relative" }}>
                              <Zap size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" step="0.01" placeholder="e.g. 3.2" value={instantForm.previousPower} onChange={e => setInstantForm(p=>({...p,previousPower:e.target.value}))} required />
                            </div>
                          </div>
                        </div>
                        <div style={{ background:"rgba(245,166,35,0.05)", border:`1px solid rgba(245,166,35,0.14)`, borderRadius:"10px", padding:"12px 16px", fontSize:"13px", color:C.muted, lineHeight:1.6 }}>
                          <span style={{ color:C.amber, fontWeight:600 }}>Note: </span>
                          Predicts power output for this exact moment. No internet or weather data needed.
                        </div>
                      </>
                    )}

                    {/* Mode 2 inputs */}
                    {mode === "forecast" && (
                      <>
                        <div>
                          <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Location</label>
                          <div style={{ position:"relative" }}>
                            <MapPin size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                            <input className="dash-input" style={{ paddingLeft:"38px" }} type="text" placeholder="e.g. Chennai, Tamil Nadu" value={forecastForm.location} onChange={e => setForecastForm(p=>({...p,location:e.target.value}))} required />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Plant Size (kW)</label>
                          <div style={{ position:"relative" }}>
                            <Zap size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                            <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" min="0.1" step="0.1" placeholder="e.g. 5.0" value={forecastForm.plantSize} onChange={e => setForecastForm(p=>({...p,plantSize:e.target.value}))} required />
                          </div>
                        </div>
                        <div style={{ background:"rgba(245,166,35,0.05)", border:`1px solid rgba(245,166,35,0.14)`, borderRadius:"10px", padding:"12px 16px", fontSize:"13px", color:C.muted, lineHeight:1.6 }}>
                          <span style={{ color:C.amber, fontWeight:600 }}>Note: </span>
                          Fetches live weather data and predicts solar generation for the next 5 days.
                        </div>
                      </>
                    )}

                    <button type="submit" className="dash-btn" style={{ alignSelf:"flex-start", marginTop:"4px" }}>
                      {mode==="instant" ? "Predict Now" : "Generate 5-Day Forecast"} <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════
               RESULTS — shown after submit
               Keeps ALL of teammate's result display
            ══════════════════════════════════════════ */}
          {submitted && (
            <div style={{ background:C.card, border:`1px solid ${C.borderHover}`, borderRadius:"22px", padding:"48px 40px", maxWidth:620, animation:"fade-up 0.5s ease-out both", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"50%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />

              {/* ── Instant prediction result ── */}
              {mode === "instant" && prediction !== null && (
                <>
                  <div style={{ textAlign:"center", marginBottom:"32px" }}>
                    {/* Icon with rings */}
                    <div style={{ position:"relative", width:80, height:80, margin:"0 auto 20px" }}>
                      {[80,60,40].map(s => (
                        <div key={s} style={{ position:"absolute", top:"50%", left:"50%", width:s, height:s, transform:"translate(-50%,-50%)", borderRadius:"50%", border:`1px solid rgba(245,166,35,${0.08*(80/s)})` }} />
                      ))}
                      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:52, height:52, borderRadius:"50%", background:"rgba(245,166,35,0.10)", display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.borderHover}` }}>
                        <Zap size={24} color={C.amber} />
                      </div>
                    </div>
                    <div style={{ fontSize:"12px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Predicted Power Output</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"48px", background:`linear-gradient(135deg, ${C.amber}, ${C.orange})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                      {Number(prediction).toFixed(2)}
                    </div>
                    <div style={{ fontSize:"18px", color:C.muted, marginTop:"4px" }}>kW</div>
                  </div>

                  {/* Efficiency */}
                  {efficiency !== null && (
                    <div style={{ background:"rgba(109,191,126,0.06)", border:"1px solid rgba(109,191,126,0.2)", borderRadius:"14px", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
                      <span style={{ fontSize:"14px", color:C.muted }}>Efficiency</span>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:C.green }}>
                        {Number(efficiency).toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* ── 5-day forecast result ── */}
              {mode === "forecast" && forecastData && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"20px", marginBottom:"6px" }}>5-Day Forecast</h2>
                  <p style={{ color:C.muted, fontSize:"14px", marginBottom:"24px" }}>Predicted solar generation by time period.</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"28px" }}>
                    {forecastData.map((item, i) => (
                      <div key={i} className="forecast-row">
                        <span style={{ fontSize:"14px", color:C.muted }}>{item.time}</span>
                        <div style={{ display:"flex", alignItems:"baseline", gap:"4px" }}>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:C.amber }}>
                            {Number(item.predicted_power).toFixed(2)}
                          </span>
                          <span style={{ fontSize:"12px", color:C.mutedDark }}>kW</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                <button className="dash-btn" onClick={reset}>New Prediction</button>
                <button onClick={reset}
                  style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:"12px", padding:"14px 24px", color:C.cream, fontFamily:"'Outfit',sans-serif", fontSize:"15px", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderHover; e.currentTarget.style.color=C.amber; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.border;      e.currentTarget.style.color=C.cream; }}
                >Change Mode</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}