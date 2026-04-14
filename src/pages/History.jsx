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

export default function History() {
  const [status, setStatus] = useState("loading");
  const [predictions, setPredictions] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setStatus("error");
      setErrorMsg("No user session found. Please log in again.");
      return;
    }

    fetch(`http://127.0.0.1:8000/predictions/${userId}`)
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
      
      <div style={{ position:"relative", zIndex:1 }}>
        <Navbar />

        <main style={{ padding:"60px 5%", maxWidth:1100, margin:"0 auto" }}>

          {/* HEADER */}
          <div style={{ marginBottom:"48px" }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"36px" }}>
              Your past <span style={{ color:C.amber }}>predictions.</span>
            </h1>
          </div>

          {/* STATES */}
          {status === "loading" && <p>Loading...</p>}

          {status === "error" && (
            <div style={{ color:"red" }}>
              {errorMsg}
            </div>
          )}

          {status === "success" && predictions.length === 0 && (
            <p>No predictions yet</p>
          )}

          {/* GRID */}
          {status === "success" && predictions.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"18px" }}>
              
              {predictions.map((p, i) => (
                <div key={i} style={{ background:C.card, padding:"20px", borderRadius:"16px" }}>

                  <div style={{ marginBottom:"12px", fontSize:"12px", color:C.muted }}>
                    Prediction #{i + 1}
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>

                    {/* IRRADIATION */}
                    <div>
                      <Sun size={14} color={C.amber} />
                      <div style={{ color:C.amber }}>
                        {p.avg_irradiation != null 
                          ? Number(p.avg_irradiation).toFixed(0) 
                          : "—"}
                      </div>
                      <small>W/m²</small>
                    </div>

                    {/* TEMP */}
                    <div>
                      <Thermometer size={14} color={C.amber} />
                      <div>
                        {p.avg_temp != null 
                          ? Number(p.avg_temp).toFixed(1) 
                          : "—"}
                      </div>
                      <small>°C</small>
                    </div>

                    {/* POWER */}
                    <div>
                      <Zap size={14} color={C.green} />
                      <div style={{ color:C.green }}>
                        {p.predicted_power != null 
                          ? Number(p.predicted_power).toFixed(2) 
                          : "—"}
                      </div>
                      <small>kW</small>
                    </div>

                    {/* DATE */}
                    <div>
                      <Clock size={14} color={C.amber} />
                      <div>
                        {p.date 
                          ? new Date(p.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short"
                            })
                          : "—"}
                      </div>
                      <small>date</small>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}