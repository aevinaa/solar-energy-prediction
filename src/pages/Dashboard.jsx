import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun, ChevronDown, LogOut, User, Settings,
  MapPin, Zap, Upload, BarChart2, ArrowRight,
  FileText, X, Thermometer, Clock, Activity,
} from "lucide-react";

const C = {
  bg:          "#0A0A07",
  bgSection:   "#0E0E0B",
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
const FAKE_USER = { name: "Dhiya Sampath Kumar", email: "dhiya@example.com", initials: "DS" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [firstTime,   setFirstTime]   = useState(isFirstVisit());
  const [mode,        setMode]        = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [efficiency, setEfficiency] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const profileRef = useRef(null);

  // Mode 1 — instant prediction fields
  const [instantForm, setInstantForm] = useState({
    radiation:     "",
    temperature:   "",
    time:          "",
    previousPower: "",
  });

  // Mode 2 — 5-day forecast fields
  const [forecastForm, setForecastForm] = useState({
    location:  "",
    plantSize: "",
  });

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectMode = (m) => {
    setMode(m);
    setSubmitted(false);
    if (firstTime) { markVisited(); setFirstTime(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "instant") {
        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: 1,
            irradiation: parseFloat(instantForm.radiation),
            ambient_temperature: parseFloat(instantForm.temperature),
            module_temperature: parseFloat(instantForm.temperature) + 5,
            hour: parseInt(instantForm.time.split(":")[0]),
            day: 15,
            month: 5,
            day_of_week: 2,
            is_daylight: 1,
            plant: 1,
            source_key: 5,
            prev_power: parseFloat(instantForm.previousPower)
          })
        });

        const data = await response.json();

        setPrediction(data.predicted_power);
        setEfficiency(data.efficiency);
     }

      if (mode === "forecast") {
        const response = await fetch("http://127.0.0.1:8000/forecast-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            location: forecastForm.location,
            plant_size: parseFloat(forecastForm.plantSize)
          })
        });

        const data = await response.json();

        setForecastData(data.forecast);
      }

      setSubmitted(true);

    } catch (error) {
      console.error(error);
    }
  };

  const reset = () => {
    setMode(null);
    setSubmitted(false);
    setInstantForm({ radiation:"", temperature:"", time:"", previousPower:"" });
    setForecastForm({ location:"", plantSize:"" });
  };

  const updateInstant  = (field) => (e) => setInstantForm(p  => ({...p,  [field]: e.target.value}));
  const updateForecast = (field) => (e) => setForecastForm(p => ({...p, [field]: e.target.value}));

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.cream, fontFamily:"'Outfit', sans-serif", position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes fade-up  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse-soft {
          0%,100% { opacity:0.5; transform:scale(1);    }
          50%      { opacity:0.9; transform:scale(1.04); }
        }
        @keyframes grid-drift {
          0%,100% { opacity:0.18; }
          50%      { opacity:0.32; }
        }

        .dot-grid {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image: radial-gradient(rgba(245,166,35,0.10) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .dash-input {
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(245,166,35,0.18);
          border-radius:12px;
          padding:13px 16px;
          color:${C.cream};
          font-family:'Outfit',sans-serif;
          font-size:15px;
          outline:none;
          transition:border-color 0.22s, background 0.22s;
        }
        .dash-input::placeholder { color:${C.mutedDark}; }
        .dash-input:focus {
          border-color:rgba(245,166,35,0.55);
          background:rgba(245,166,35,0.04);
        }

        .dash-btn {
          background:${C.amber};
          color:${C.bg};
          border:none;
          border-radius:12px;
          padding:14px 32px;
          font-family:'Outfit',sans-serif;
          font-size:15px;
          font-weight:700;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          gap:8px;
          transition:all 0.22s;
        }
        .dash-btn:hover { background:${C.amberLight}; transform:translateY(-2px); }

        .mode-card {
          flex:1;
          background:${C.card};
          border:1px solid ${C.border};
          border-radius:22px;
          padding:36px;
          cursor:pointer;
          transition:all 0.28s;
          position:relative;
          overflow:hidden;
          min-width:240px;
        }
        .mode-card:hover, .mode-card.selected {
          background:${C.cardHover};
          border-color:${C.borderHover};
          transform:translateY(-4px);
          box-shadow:0 0 32px rgba(245,166,35,0.10);
        }
        .mode-card.selected { border-color:${C.amber}; }

        .profile-dropdown {
          position:absolute; top:calc(100% + 10px); right:0;
          background:#1A1A16;
          border:1px solid ${C.border};
          border-radius:16px; padding:8px; min-width:210px;
          z-index:200;
          animation:fade-in 0.18s ease-out;
          box-shadow:0 16px 48px rgba(0,0,0,0.6);
        }
        .drop-item {
          display:flex; align-items:center; gap:10px;
          padding:11px 14px; border-radius:10px;
          cursor:pointer; font-size:14px; color:${C.muted};
          transition:all 0.18s; border:none; background:none;
          width:100%; font-family:'Outfit',sans-serif;
        }
        .drop-item:hover { background:rgba(245,166,35,0.07); color:${C.cream}; }
        .drop-item.danger:hover { background:rgba(255,80,80,0.08); color:#ff7070; }

        .stat-pill {
          display:flex; align-items:center; gap:10px;
          background:rgba(245,166,35,0.05);
          border:1px solid ${C.border};
          border-radius:12px; padding:10px 16px;
          transition:border-color 0.2s;
        }
        .stat-pill:hover { border-color:${C.borderHover}; }

        /* two-column grid for mode 1 inputs */
        .input-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:18px;
        }
        @media(max-width:540px) {
          .input-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── Background layers ── */}
      <div className="dot-grid" />
      {/* Removed right-side decorative ball */}
      <div style={{ position:"fixed", bottom:"-5%", left:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,104,53,0.05) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      {/* Removed decorative solar ring cluster */}

      {/* Vertical accent lines */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        {[15,35,55,75].map((pct,i) => (
          <div key={i} style={{ position:"absolute", top:0, left:`${pct}%`, width:1, height:"100%", background:`linear-gradient(180deg, transparent, rgba(245,166,35,${0.04-i*0.005}), transparent)` }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ── NAVBAR ── */}
        <nav style={{ position:"sticky", top:0, zIndex:100, height:"68px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 5%", background:"rgba(10,10,7,0.85)", backdropFilter:"blur(24px)", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }} onClick={() => navigate("/dashboard")}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:`radial-gradient(circle at 40% 35%, #FFE580, ${C.amber} 55%, ${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 16px rgba(245,166,35,0.4)` }}>
              <Sun size={16} color={C.bg} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"17px" }}>
              Sun<span style={{ color:C.amber }}>Insight</span>
            </span>
          </div>

          <div style={{ display:"flex", gap:"28px" }}>
            {[{label:"Dashboard",active:true},{label:"History",active:false},{label:"Settings",active:false}].map(l => (
              <span key={l.label} style={{ fontSize:"14px", fontWeight:500, cursor:"pointer", color:l.active?C.cream:C.muted, borderBottom:l.active?`2px solid ${C.amber}`:"2px solid transparent", paddingBottom:"4px", transition:"color 0.2s" }}>{l.label}</span>
            ))}
          </div>

          <div ref={profileRef} style={{ position:"relative" }}>
            <button onClick={() => setProfileOpen(p => !p)} style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(245,166,35,0.06)", border:`1px solid ${C.border}`, borderRadius:"100px", padding:"6px 14px 6px 6px", cursor:"pointer", transition:"all 0.2s", color:C.cream, fontFamily:"'Outfit',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderHover; e.currentTarget.style.background="rgba(245,166,35,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border;      e.currentTarget.style.background="rgba(245,166,35,0.06)"; }}
            >
              <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg, ${C.amber}, ${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, color:C.bg }}>{FAKE_USER.initials}</div>
              <span style={{ fontSize:"14px", fontWeight:500 }}>{FAKE_USER.name.split(" ")[0]}</span>
              <ChevronDown size={14} color={C.muted} style={{ transition:"transform 0.2s", transform:profileOpen?"rotate(180deg)":"rotate(0deg)" }} />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div style={{ padding:"10px 14px 14px", borderBottom:`1px solid ${C.border}`, marginBottom:"6px" }}>
                  <div style={{ fontSize:"14px", fontWeight:600, color:C.cream }}>{FAKE_USER.name}</div>
                  <div style={{ fontSize:"12px", color:C.mutedDark, marginTop:"2px" }}>{FAKE_USER.email}</div>
                </div>
                <button className="drop-item"><User size={15} />My Account</button>
                <button className="drop-item"><BarChart2 size={15} />My Predictions</button>
                <button className="drop-item"><Settings size={15} />Settings</button>
                <div style={{ borderTop:`1px solid ${C.border}`, margin:"6px 0" }} />
                <button className="drop-item danger" onClick={() => navigate("/")}><LogOut size={15} />Log Out</button>
              </div>
            )}
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main style={{ padding:"60px 5%", maxWidth:1100, margin:"0 auto" }}>

          {/* Greeting */}
          <div style={{ marginBottom:"48px", animation:"fade-up 0.6s ease-out both" }}>
            <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.22)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"6px 14px", borderRadius:"100px", marginBottom:"16px" }}>
              {firstTime ? "Welcome to SunInsight" : "Welcome back"}
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(28px, 4vw, 52px)", lineHeight:1.08, marginBottom:"14px" }}>
              {firstTime
                ? <>{`Let's get you started,`}<br /><span style={{ color:C.amber }}>{FAKE_USER.name.split(" ")[0]}.</span></>
                : <>Your predictions,<br /><span style={{ color:C.amber }}>{FAKE_USER.name.split(" ")[0]}.</span></>
              }
            </h1>
            <p style={{ color:C.muted, fontSize:"16px", maxWidth:480, lineHeight:1.75 }}>
              {firstTime ? "Choose a prediction mode below to get started." : "Run a new prediction or pick up where you left off."}
            </p>
          </div>

          {/* Stat pills */}
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

          {/* Mode selection + form */}
          {!submitted && (
            <>
              <div style={{ marginBottom:"24px" }}>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", marginBottom:"6px" }}>Select a prediction mode</h2>
                <p style={{ color:C.muted, fontSize:"14px" }}>Pick one — you can switch anytime.</p>
              </div>

              <div style={{ display:"flex", gap:"18px", marginBottom:"36px", flexWrap:"wrap" }}>

                {/* ── MODE 1 — Instant Prediction ── */}
                <div className={`mode-card${mode==="instant"?" selected":""}`} onClick={() => selectMode("instant")}>
                  {mode==="instant" && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"55%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />}
                  <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.08)`, pointerEvents:"none" }} />
                  <div style={{ position:"absolute", top:-20, right:-20, width:80,  height:80,  borderRadius:"50%", border:`1px solid rgba(245,166,35,0.06)`, pointerEvents:"none" }} />

                  <div style={{ width:52, height:52, borderRadius:"14px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px" }}>
                    <Activity size={24} color={C.amber} />
                  </div>
                  <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.2)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:"100px", marginBottom:"14px" }}>
                    Mode 1
                  </div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"19px", marginBottom:"10px", color:C.cream }}>Instant Prediction</h3>
                  <p style={{ color:C.muted, fontSize:"14px", lineHeight:1.75 }}>
                    Enter radiation, temperature, time and previous power. Get a predicted output for that exact moment — no weather API used.
                  </p>
                  <div style={{ marginTop:"20px", fontSize:"13px", fontWeight:600, color:C.amber }}>
                    {mode==="instant" ? "Selected ✓" : "Select →"}
                  </div>
                </div>

                {/* ── MODE 2 — 5-Day Forecast ── */}
                <div className={`mode-card${mode==="forecast"?" selected":""}`} onClick={() => selectMode("forecast")}>
                  {mode==="forecast" && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"55%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />}
                  <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.08)`, pointerEvents:"none" }} />
                  <div style={{ position:"absolute", top:-20, right:-20, width:80,  height:80,  borderRadius:"50%", border:`1px solid rgba(245,166,35,0.06)`, pointerEvents:"none" }} />

                  <div style={{ width:52, height:52, borderRadius:"14px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px" }}>
                    <BarChart2 size={24} color={C.amber} />
                  </div>
                  <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.2)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:"100px", marginBottom:"14px" }}>
                    Mode 2
                  </div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"19px", marginBottom:"10px", color:C.cream }}>5-Day Forecast</h3>
                  <p style={{ color:C.muted, fontSize:"14px", lineHeight:1.75 }}>
                    Enter your location and plant size. We fetch live weather data and predict your solar generation for the next 5 days.
                  </p>
                  <div style={{ marginTop:"20px", fontSize:"13px", fontWeight:600, color:C.amber }}>
                    {mode==="forecast" ? "Selected ✓" : "Select →"}
                  </div>
                </div>

              </div>

              {/* ── FORM ── */}
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

                    {/* ── MODE 1 FIELDS ── */}
                    {mode === "instant" && (
                      <>
                        <div className="input-grid">

                          {/* Radiation */}
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>
                              Solar Radiation (W/m²)
                            </label>
                            <div style={{ position:"relative" }}>
                              <Sun size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" step="0.01" placeholder="e.g. 850.5" value={instantForm.radiation} onChange={updateInstant("radiation")} required />
                            </div>
                          </div>

                          {/* Temperature */}
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>
                              Temperature (°C)
                            </label>
                            <div style={{ position:"relative" }}>
                              <Thermometer size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" step="0.1" placeholder="e.g. 32.5" value={instantForm.temperature} onChange={updateInstant("temperature")} required />
                            </div>
                          </div>

                          {/* Time */}
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>
                              Time
                            </label>
                            <div style={{ position:"relative" }}>
                              <Clock size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="time" value={instantForm.time} onChange={updateInstant("time")} required />
                            </div>
                          </div>

                          {/* Previous Power */}
                          <div>
                            <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>
                              Previous Power (kW)
                            </label>
                            <div style={{ position:"relative" }}>
                              <Zap size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                              <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" step="0.01" placeholder="e.g. 3.2" value={instantForm.previousPower} onChange={updateInstant("previousPower")} required />
                            </div>
                          </div>

                        </div>

                        {/* Note removed for instant mode */}
                      </>
                    )}

                    {/* ── MODE 2 FIELDS ── */}
                    {mode === "forecast" && (
                      <>
                        {/* Location */}
                        <div>
                          <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Location</label>
                          <div style={{ position:"relative" }}>
                            <MapPin size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                            <input className="dash-input" style={{ paddingLeft:"38px" }} type="text" placeholder="e.g. Chennai, Tamil Nadu" value={forecastForm.location} onChange={updateForecast("location")} required />
                          </div>
                        </div>

                        {/* Plant size */}
                        <div>
                          <label style={{ fontSize:"13px", fontWeight:500, color:C.muted, display:"block", marginBottom:"7px" }}>Plant Size (kW)</label>
                          <div style={{ position:"relative" }}>
                            <Zap size={15} color={C.mutedDark} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                            <input className="dash-input" style={{ paddingLeft:"38px" }} type="number" min="0.1" step="0.1" placeholder="e.g. 5.0" value={forecastForm.plantSize} onChange={updateForecast("plantSize")} required />
                          </div>
                        </div>

                        {/* Note removed for forecast mode */}
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

          {/* ── Submitted state ── */}
          {submitted && (
            <div style={{ background:C.card, border:`1px solid ${C.borderHover}`, borderRadius:"22px", padding:"52px 40px", textAlign:"center", maxWidth:560, animation:"fade-up 0.5s ease-out both", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"50%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />
              <div style={{ position:"relative", width:80, height:80, margin:"0 auto 24px" }}>
                {[80,60,40].map(s => (
                  <div key={s} style={{ position:"absolute", top:"50%", left:"50%", width:s, height:s, transform:"translate(-50%,-50%)", borderRadius:"50%", border:`1px solid rgba(245,166,35,${0.08*(80/s)})` }} />
                ))}
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:56, height:56, borderRadius:"50%", background:"rgba(245,166,35,0.10)", display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.borderHover}` }}>
                  <BarChart2 size={26} color={C.amber} />
                </div>
              </div>
              {mode === "instant" && prediction && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"22px", marginBottom:"10px" }}>
                    Predicted Power: {prediction.toFixed(2)} kW
                  </h2>
                  <p style={{ color:C.muted, fontSize:"15px", lineHeight:1.75, marginBottom:"30px" }}>
                    Efficiency: {efficiency.toFixed(2)}
                  </p>
                </>
              )}

              {mode === "forecast" && forecastData && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"22px", marginBottom:"10px" }}>
                    Forecast Results
                  </h2>
                  <div style={{ color:C.muted, fontSize:"14px", marginBottom:"30px" }}>
                    {forecastData.map((item, i) => (
                      <p key={i}>
                        {item.time} → {item.predicted_power} kW
                      </p>
                    ))}
                  </div>
                </>
              )}
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                <button className="dash-btn" onClick={reset}>New Prediction</button>
                <button onClick={reset} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:"12px", padding:"14px 24px", color:C.cream, fontFamily:"'Outfit',sans-serif", fontSize:"15px", cursor:"pointer", transition:"all 0.2s" }}
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