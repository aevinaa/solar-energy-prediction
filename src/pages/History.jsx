/**
 * History.jsx
 * Fetches prediction history from:
 *   GET /predictions/{user_id}
 * user_id is read from localStorage.
 * Place at: src/pages/History.jsx
 */

import { useState, useEffect } from "react";
import { BarChart2, Thermometer, Zap, Clock, Sun } from "lucide-react";
import Navbar from "../components/Navbar";

const C = {
  bg:          "#0A0A07",
  card:        "#131310",
  cardHover:   "#1C1C16",
  amber:       "#F5A623",
  orange:      "#FF6835",
  cream:       "#F0ECD8",
  muted:       "#A89F88",
  mutedDark:   "#6E6A5A",
  border:      "rgba(245,166,35,0.12)",
  borderHover: "rgba(245,166,35,0.30)",
  green:       "#6dbf7e",
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function History() {
  // Three possible states: "loading" | "success" | "error"
  const [status,      setStatus]      = useState("loading");
  const [predictions, setPredictions] = useState([]);
  const [errorMsg,    setErrorMsg]    = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    // If no user_id in localStorage → not logged in
    if (!userId) {
      setStatus("error");
      setErrorMsg("No user session found. Please log in again.");
      return;
    }

    fetch(`${BASE_URL}/predictions/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(json => {
        setPredictions(json.data || []);
        setStatus("success");
      })
      .catch(err => {
        setErrorMsg(err.message || "Failed to fetch predictions.");
        setStatus("error");
      });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.cream, fontFamily:"'Outfit',sans-serif", position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes fade-up  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes grid-drift { 0%,100% { opacity:0.18; } 50% { opacity:0.32; } }
        @keyframes pulse-soft {
          0%,100% { opacity:0.5; transform:scale(1);    }
          50%      { opacity:0.9; transform:scale(1.04); }
        }

        .hist-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 18px;
          padding: 26px 28px;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .hist-card:hover {
          background: ${C.cardHover};
          border-color: ${C.borderHover};
          transform: translateY(-3px);
          box-shadow: 0 0 24px rgba(245,166,35,0.07);
        }
      `}</style>

      {/* Background decorations */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"radial-gradient(rgba(245,166,35,0.09) 1px, transparent 1px)", backgroundSize:"36px 36px", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)" }} />
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-5%", left:"-5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,104,53,0.04) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      {/* Decorative ring cluster */}
      <div style={{ position:"fixed", top:"8%", right:"3%", pointerEvents:"none", zIndex:0, opacity:0.6 }}>
        {[60,100,140,180].map((r,i) => (
          <div key={r} style={{ position:"absolute", top:"50%", left:"50%", width:r*2, height:r*2, transform:"translate(-50%,-50%)", borderRadius:"50%", border:`1px solid rgba(245,166,35,${0.10-i*0.018})`, animation:`grid-drift ${3+i*0.8}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
        ))}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:26, height:26, borderRadius:"50%", background:"radial-gradient(circle at 40% 35%, #FFD966, #F5A623 55%, #D4631A)", boxShadow:"0 0 20px rgba(245,166,35,0.5)", animation:"pulse-soft 4s ease-in-out infinite" }} />
      </div>

      <div style={{ position:"relative", zIndex:1 }}>
        <Navbar />

        <main style={{ padding:"60px 5%", maxWidth:1100, margin:"0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom:"48px", animation:"fade-up 0.6s ease-out both" }}>
            <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.22)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"6px 14px", borderRadius:"100px", marginBottom:"16px" }}>
              Prediction History
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,46px)", lineHeight:1.08, marginBottom:"12px" }}>
              Your past <span style={{ color:C.amber }}>predictions.</span>
            </h1>
            <p style={{ color:C.muted, fontSize:"15px", lineHeight:1.75 }}>
              Every instant prediction you've run, all in one place.
            </p>
          </div>

          {/* ── Loading state ── */}
          {status === "loading" && (
            <div style={{ display:"flex", alignItems:"center", gap:"14px", color:C.muted, fontSize:"15px" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${C.amber}`, borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
              Fetching your predictions...
            </div>
          )}

          {/* ── Error state ── */}
          {status === "error" && (
            <div style={{ background:"rgba(255,80,80,0.06)", border:"1px solid rgba(255,80,80,0.2)", borderRadius:"16px", padding:"28px 32px", maxWidth:480 }}>
              <div style={{ fontSize:"15px", color:"#ff7070", fontWeight:600, marginBottom:"6px" }}>Something went wrong</div>
              <div style={{ fontSize:"14px", color:C.muted }}>{errorMsg}</div>
            </div>
          )}

          {/* ── Empty state ── */}
          {status === "success" && predictions.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 20px", animation:"fade-up 0.5s ease-out both" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(245,166,35,0.08)", border:`1px solid ${C.borderHover}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
                <BarChart2 size={30} color={C.amber} />
              </div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"20px", marginBottom:"10px" }}>No predictions yet</h3>
              <p style={{ color:C.muted, fontSize:"15px", maxWidth:340, margin:"0 auto" }}>
                Head to the dashboard and run your first prediction to see results here.
              </p>
            </div>
          )}

          {/* ── Predictions grid ── */}
          {status === "success" && predictions.length > 0 && (
            <>
              {/* Count badge */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
                <div style={{ background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.22)`, color:C.amber, fontSize:"13px", fontWeight:600, padding:"5px 14px", borderRadius:"100px" }}>
                  {predictions.length} prediction{predictions.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"18px" }}>
                {predictions.map((p, i) => (
                  <div key={i} className="hist-card" style={{ animationDelay:`${i * 0.05}s`, animation:"fade-up 0.5s ease-out both" }}>

                    {/* Amber top accent */}
                    <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"45%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />

                    {/* Prediction number */}
                    <div style={{ fontSize:"11px", color:C.mutedDark, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"18px" }}>
                      Prediction #{i + 1}
                    </div>

                    {/* 4 data points */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>

                      {/* Irradiation */}
                      <div style={{ background:"rgba(245,166,35,0.05)", borderRadius:"12px", padding:"12px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
                          <Sun size={13} color={C.amber} />
                          <span style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em" }}>Irradiation</span>
                        </div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:C.amber }}>
                          {p.irradiation ?? "—"}
                        </div>
                        <div style={{ fontSize:"11px", color:C.mutedDark, marginTop:"2px" }}>W/m²</div>
                      </div>

                      {/* Temperature */}
                      <div style={{ background:"rgba(245,166,35,0.05)", borderRadius:"12px", padding:"12px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
                          <Thermometer size={13} color={C.amber} />
                          <span style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em" }}>Temp</span>
                        </div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:C.cream }}>
                          {p.ambient_temperature ?? "—"}
                        </div>
                        <div style={{ fontSize:"11px", color:C.mutedDark, marginTop:"2px" }}>°C</div>
                      </div>

                      {/* Predicted Power */}
                      <div style={{ background:"rgba(109,191,126,0.06)", borderRadius:"12px", padding:"12px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
                          <Zap size={13} color={C.green} />
                          <span style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em" }}>Predicted</span>
                        </div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:C.green }}>
                          {p.predicted_power != null ? Number(p.predicted_power).toFixed(2) : "—"}
                        </div>
                        <div style={{ fontSize:"11px", color:C.mutedDark, marginTop:"2px" }}>kW</div>
                      </div>

                      {/* Hour */}
                      <div style={{ background:"rgba(245,166,35,0.05)", borderRadius:"12px", padding:"12px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
                          <Clock size={13} color={C.amber} />
                          <span style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em" }}>Hour</span>
                        </div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:C.cream }}>
                          {p.hour != null ? `${String(p.hour).padStart(2,"0")}:00` : "—"}
                        </div>
                        <div style={{ fontSize:"11px", color:C.mutedDark, marginTop:"2px" }}>local time</div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}