import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";        // ← import here at the top
import {
  Sun, BarChart2, MapPin, ArrowRight,
  TrendingUp, CloudSun, Battery, Activity, Cpu,
} from "lucide-react";
import "./LandingPage.css";

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
  border:      "rgba(245,166,35,0.12)",
  borderHover: "rgba(245,166,35,0.30)",
};

function scrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: "smooth" });
}

const NAV_LINKS = [
  { label: "About",        id: "about"    },
  { label: "Features",     id: "features" },
  { label: "How It Works", id: "how"      },
  { label: "Who It's For", id: "whofor"   },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // ✅ useNavigate MUST be inside the component — never outside
  const navigate = useNavigate();

  // ✅ goToLogin defined inside the component, uses navigate
  const goToLogin = () => navigate("/login");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      background: C.bg,
      color:      C.cream,
      fontFamily: "'Outfit', sans-serif",
      minHeight:  "100vh",
      overflowX:  "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0px);  }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(245,166,35,0.35); }
          50%       { box-shadow: 0 0 44px rgba(245,166,35,0.65); }
        }
        @keyframes drift-up {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-8px); }
        }
        @keyframes drift-down {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(8px); }
        }
        @keyframes grid-fade {
          0%, 100% { opacity: 0.20; }
          50%       { opacity: 0.38; }
        }

        .nav-link {
          color: ${C.muted};
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: 'Outfit', sans-serif;
        }
        .nav-link:hover { color: ${C.cream}; }

        .btn-primary {
          background: ${C.amber};
          color: ${C.bg};
          border: none;
          padding: 11px 26px;
          border-radius: 100px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.22s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: ${C.amberLight}; transform: translateY(-2px); }

        .btn-ghost {
          background: transparent;
          color: ${C.cream};
          border: 1px solid ${C.border};
          padding: 11px 22px;
          border-radius: 100px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.22s;
          white-space: nowrap;
        }
        .btn-ghost:hover { border-color: ${C.borderHover}; color: ${C.amber}; }

        .ui-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 22px;
          padding: 34px;
          transition: background 0.28s, border-color 0.28s, transform 0.28s, box-shadow 0.28s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .ui-card:hover {
          background: ${C.cardHover};
          border-color: ${C.borderHover};
          transform: translateY(-5px);
          box-shadow: 0 0 28px rgba(245,166,35,0.08);
        }

        .stat-card {
          position: absolute;
          background: rgba(19, 19, 16, 0.92);
          border: 1px solid rgba(245, 166, 35, 0.28);
          border-radius: 16px;
          padding: 14px 18px;
          backdrop-filter: blur(12px);
          white-space: nowrap;
        }

        .section-tag {
          display: inline-block;
          background: rgba(245,166,35,0.09);
          border: 1px solid rgba(245,166,35,0.22);
          color: ${C.amber};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 18px;
        }

        .headline-xl {
          font-family: 'Syne', sans-serif;
          font-size: clamp(42px, 7vw, 82px);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -0.025em;
        }
        .headline-md {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 700;
          line-height: 1.14;
          letter-spacing: -0.02em;
        }

        .fade-up-1 { animation: fade-up 0.75s 0.05s ease-out both; }
        .fade-up-2 { animation: fade-up 0.75s 0.18s ease-out both; }
        .fade-up-3 { animation: fade-up 0.75s 0.30s ease-out both; }
        .fade-up-4 { animation: fade-up 0.75s 0.44s ease-out both; }

        @media (max-width: 900px) {
          .hero-layout  { flex-direction: column !important; }
          .three-grid   { grid-template-columns: 1fr !important; }
          .steps-grid   { grid-template-columns: 1fr 1fr !important; }
          .hero-visual  { display: none; }
        }
        @media (max-width: 540px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .footer-row { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        height:"68px", display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 6%",
        background:     scrolled ? "rgba(10,10,7,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(22px)"         : "none",
        borderBottom:   scrolled ? `1px solid ${C.border}` : "none",
        transition:"all 0.35s ease",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:`radial-gradient(circle at 40% 35%, #FFE580, ${C.amber} 55%, ${C.orange})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 18px rgba(245,166,35,0.45)`,
          }}>
            <Sun size={17} color={C.bg} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", letterSpacing:"-0.01em" }}>
            Sun<span style={{ color:C.amber }}>Insight</span>
          </span>
        </div>

        <div style={{ display:"flex", gap:"34px", alignItems:"center" }}>
          {NAV_LINKS.map(({ label, id }) => (
            <button key={label} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        <div style={{ display:"flex", gap:"10px" }}>
          <button className="btn-ghost"   onClick={goToLogin}>Log In</button>
          <button className="btn-primary" onClick={goToLogin}>Get Started <ArrowRight size={14} /></button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="about" style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        padding:"100px 6% 60px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:"15%", right:"5%", width:700, height:700, pointerEvents:"none", background:"radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:"10%", left:"0%", width:400, height:400, pointerEvents:"none", background:"radial-gradient(circle, rgba(255,104,53,0.04) 0%, transparent 65%)" }} />

        <div className="hero-layout" style={{ display:"flex", gap:"60px", alignItems:"center", width:"100%", maxWidth:1200, margin:"0 auto" }}>
          <div style={{ flex:1, maxWidth:580 }}>
            <div className="section-tag fade-up-1">AI-Powered Solar Intelligence</div>
            <h1 className="headline-xl fade-up-2" style={{ marginBottom:"24px" }}>
              Know Your Sun.<br />
              <span style={{ color:C.amber }}>Before It Rises.</span>
            </h1>
            <p className="fade-up-3" style={{ fontSize:"17px", lineHeight:1.8, color:C.muted, marginBottom:"40px", maxWidth:440 }}>
              SunInsight combines your inverter data, weather forecasts, and
              machine learning to predict your solar generation — before it happens.
            </p>
            <div className="fade-up-4" style={{ display:"flex", gap:"14px", alignItems:"center", flexWrap:"wrap" }}>
              <button className="btn-primary" style={{ fontSize:"16px", padding:"14px 32px" }} onClick={goToLogin}>
                Start Forecasting <ArrowRight size={16} />
              </button>
            </div>
            <div className="fade-up-4" style={{ marginTop:"52px" }}>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"14px",
                background:"rgba(245,166,35,0.06)", border:`1px solid ${C.border}`,
                borderRadius:"16px", padding:"16px 24px",
              }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:C.amber, boxShadow:`0 0 10px ${C.amber}`, flexShrink:0 }} />
                <div>
                  <div style={{
                    fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"22px",
                    background:`linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                  }}>93% Forecast Accuracy</div>
                  <div style={{ fontSize:"12px", color:C.muted, marginTop:"2px" }}>
                    measured against actual inverter output
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual" style={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center" }}>
            <SolarVisual C={C} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"90px 6%", background:C.bgSection }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <div className="section-tag">What We Do</div>
            <h2 className="headline-md">Everything solar, in one place</h2>
            <p style={{ color:C.muted, marginTop:"16px", fontSize:"17px", maxWidth:560, margin:"16px auto 0" }}>
              Keep track of your solar system through predictive insights and evolving performance trends.
            </p>
          </div>
          <div className="three-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"20px" }}>
            {[
              { icon:<Activity size={26} color={C.amber}/>,   title:"System Performance Overview", desc:"Track your solar performance with clear, actionable insights all in one intuitive dashboard." },
              { icon:<TrendingUp size={26} color={C.amber}/>, title:"Smart Forecasting",            desc:"Our ML model ingests weather forecasts and your history to predict generation with high accuracy." },
              { icon:<Battery size={26} color={C.amber}/>,    title:"Energy Optimisation",          desc:"Know exactly when to store, sell, or shift your load. Data-driven decisions that cut grid dependency and save money." },
            ].map(f => (
              <div key={f.title} className="ui-card">
                <div style={{ width:54, height:54, borderRadius:"14px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"22px" }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"19px", marginBottom:"12px", color:C.cream }}>{f.title}</h3>
                <p style={{ color:C.muted, lineHeight:1.75, fontSize:"15px" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:"90px 6%" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"64px" }}>
            <div className="section-tag">The Process</div>
            <h2 className="headline-md">How SunInsight Works</h2>
            <p style={{ color:C.muted, marginTop:"16px", fontSize:"17px", maxWidth:480, margin:"16px auto 0" }}>
              Four simple steps from location to forecast.
            </p>
          </div>
          <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"10px", position:"relative" }}>
            <div style={{ position:"absolute", top:"44px", left:"12.5%", right:"12.5%", height:"1px", background:`linear-gradient(90deg, transparent, ${C.borderHover}, transparent)`, pointerEvents:"none" }} />
            {[
              { num:"01", icon:<MapPin size={22} color={C.amber}/>,    title:"Enter Location",    desc:"Pin your solar installation. We fetch historical irradiance and weather data for your exact coordinates." },
              { num:"02", icon:<CloudSun size={22} color={C.amber}/>,  title:"Fetch Forecast",    desc:"We pull live weather data — cloud cover, UV index, temperature — from trusted meteorological APIs." },
              { num:"03", icon:<Cpu size={22} color={C.amber}/>,       title:"Run the Model",     desc:"Our trained ML model processes your system specs, weather data, and patterns to generate solar predictions." },
              { num:"04", icon:<BarChart2 size={22} color={C.amber}/>, title:"See Your Forecast", desc:"View interactive charts of predicted generation. Plan consumption, storage, and grid export confidently." },
            ].map(step => (
              <div key={step.num} style={{ textAlign:"center", padding:"16px 12px" }}>
                <div style={{ position:"relative", display:"inline-block", marginBottom:"22px" }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", background:C.card, border:`1px solid ${C.borderHover}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", position:"relative", zIndex:1 }}>{step.icon}</div>
                  <div style={{ position:"absolute", top:-4, right:-10, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"11px", color:C.amber, opacity:0.45, letterSpacing:"0.06em" }}>{step.num}</div>
                </div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"17px", marginBottom:"10px", color:C.cream }}>{step.title}</h3>
                <p style={{ color:C.muted, fontSize:"14px", lineHeight:1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="whofor" style={{ padding:"90px 6%", background:C.bgSection }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"60px" }}>
            <div className="section-tag">Who It's For</div>
            <h2 className="headline-md">Built for every solar user</h2>
            <p style={{ color:C.muted, marginTop:"16px", fontSize:"17px", maxWidth:480, margin:"16px auto 0" }}>
              Whether you're powering a home or managing a grid, SunInsight speaks your language.
            </p>
          </div>
          <div className="three-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"20px" }}>
            {[
              { emoji:"🏠", label:"Homeowners",     headline:"Stop guessing your bill",    perks:["Know when to run appliances","Maximise battery self-consumption","Forecast surplus before it happens"] },
              { emoji:"🏭", label:"Businesses",     headline:"Lock in your energy costs",  perks:["Plan shifts around solar peaks","Reduce grid dependency reliably","Get daily generation reports"] },
              { emoji:"⚡", label:"Grid Operators", headline:"Predict distributed supply", perks:["Aggregate rooftop forecasts","Balance demand and generation","Smooth renewable integration"] },
            ].map(card => (
              <div key={card.label} className="ui-card">
                <div style={{ width:56, height:56, borderRadius:"14px", background:"rgba(245,166,35,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", marginBottom:"18px" }}>
                  {card.emoji}
                </div>
                <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.2)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:"100px", marginBottom:"14px" }}>
                  {card.label}
                </div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"20px", color:C.cream, marginBottom:"20px" }}>
                  {card.headline}
                </h3>
                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"12px" }}>
                  {card.perks.map(perk => (
                    <li key={perk} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:C.amber, flexShrink:0, boxShadow:`0 0 6px ${C.amber}` }} />
                      <span style={{ color:C.muted, fontSize:"14px", lineHeight:1.6 }}>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"80px 6%" }}>
        <div style={{ maxWidth:900, margin:"0 auto", background:"linear-gradient(135deg, #1C1A10, #131108, #1A1208)", border:`1px solid ${C.borderHover}`, borderRadius:"28px", padding:"70px 52px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-50%", left:"50%", transform:"translateX(-50%)", width:500, height:500, pointerEvents:"none", background:"radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)" }} />
          <div className="section-tag">Get Started Free</div>
          <h2 className="headline-md" style={{ marginBottom:"18px" }}>Ready to harness<br />every ray of sunlight?</h2>
          <p style={{ color:C.muted, fontSize:"17px", maxWidth:400, margin:"0 auto 38px", lineHeight:1.7 }}>
            Join solar users making smarter energy decisions with SunInsight.
          </p>
          <button className="btn-primary" style={{ fontSize:"16px", padding:"16px 44px", animation:"glow-pulse 3s ease-in-out infinite" }} onClick={goToLogin}>
            Create Free Account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"36px 6%" }}>
        <div className="footer-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"20px", maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`radial-gradient(circle, #FFE580, ${C.amber})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sun size={13} color={C.bg} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"15px" }}>
              Sun<span style={{ color:C.amber }}>Insight</span>
            </span>
          </div>
          <p style={{ color:C.muted, fontSize:"13px" }}>© SunInsight</p>
          <div style={{ display:"flex", gap:"22px" }}>
            {["Privacy","Terms","Contact"].map(l => (
              <span key={l} style={{ color:C.muted, fontSize:"13px", cursor:"pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── SOLAR VISUAL ─────────────────────────────────────────────
function SolarVisual({ C }) {
  const bars = [18, 30, 48, 62, 55, 78, 90, 85, 72, 60, 44, 28];

  return (
    <div style={{ position:"relative", width:"600px", height:"600px", display:"flex", alignItems:"center", justifyContent:"center" }}>

      {/* Polar grid — z:0, behind everything */}
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }}>
        {[110, 175, 245, 290].map((r, i) => (
          <div key={r} style={{
            position:"absolute", top:"50%", left:"50%",
            width: r * 2, height: r * 2,
            transform:"translate(-50%,-50%)",
            borderRadius:"50%",
            border:`1px solid rgba(245,166,35,${0.10 - i * 0.015})`,
            animation:`grid-fade ${3 + i * 0.7}s ease-in-out infinite`,
            animationDelay:`${i * 0.5}s`,
          }} />
        ))}
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map(deg => (
          <div key={deg} style={{
            position:"absolute", top:"50%", left:"50%",
            width:290, height:1,
            transformOrigin:"0 50%",
            transform:`translateY(-50%) rotate(${deg}deg)`,
            background:"linear-gradient(90deg, rgba(245,166,35,0.10), transparent)",
          }} />
        ))}
      </div>

      {/* Sun rings + core — z:1 */}
      <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div className="sun-ring" />
        <div className="sun-ring" />
        <div className="sun-ring" />
        <div className="sun-ring" />
        <div className="sun-ring" />
        <div className="sun-core" />
      </div>

      {/* Today's Output — top left */}
      <div className="stat-card" style={{ top:"55px", left:"20px", zIndex:2, animation:"drift-up 6s ease-in-out infinite" }}>
        <div style={{ fontSize:"11px", color:C.muted, marginBottom:"4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Today's Output</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"22px", color:C.amber }}>18.4 kWh</div>
        <div style={{ fontSize:"12px", color:"#6dbf7e", marginTop:"3px" }}>↑ 12% vs yesterday</div>
      </div>

      {/* Peak Power — top right */}
      <div className="stat-card" style={{ top:"75px", right:"5px", zIndex:2, animation:"drift-down 7s ease-in-out infinite", animationDelay:"1s" }}>
        <div style={{ fontSize:"11px", color:C.muted, marginBottom:"4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Peak Power</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"22px", color:C.cream }}>4.2 kW</div>
        <div style={{ fontSize:"12px", color:C.muted, marginTop:"3px" }}>at 12:34 PM</div>
      </div>

      {/* Tomorrow — bottom left */}
      <div className="stat-card" style={{ bottom:"120px", left:"8px", zIndex:2, animation:"drift-down 8s ease-in-out infinite", animationDelay:"2s" }}>
        <div style={{ fontSize:"11px", color:C.muted, marginBottom:"4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>Tomorrow</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"22px", color:C.cream }}>21.1 kWh</div>
        <div style={{ fontSize:"12px", color:C.amber, marginTop:"3px" }}>Forecast ↑</div>
      </div>

      {/* Sparkline — bottom right */}
      <div style={{
        position:"absolute", bottom:"22px", left:"80%",
        transform:"translateX(-50%)", zIndex:2,
        display:"flex", alignItems:"flex-end", gap:"4px",
        padding:"12px 18px",
        background:"rgba(19,19,16,0.88)",
        border:"1px solid rgba(245,166,35,0.18)",
        borderRadius:"14px", backdropFilter:"blur(10px)",
      }}>
        <div>
          <div style={{ fontSize:"10px", color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"6px" }}>Generation Today</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"4px" }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                width:"8px", height:`${h * 0.48}px`,
                borderRadius:"3px 3px 0 0",
                background: h > 70
                  ? `linear-gradient(180deg, ${C.amber}, ${C.orange})`
                  : `rgba(245,166,35,${0.22 + h / 200})`,
              }} />
            ))}
          </div>
        </div>
        <div style={{ marginLeft:"10px", borderLeft:"1px solid rgba(245,166,35,0.15)", paddingLeft:"12px" }}>
          <div style={{ fontSize:"10px", color:C.muted }}>kWh</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"18px", color:C.amber }}>18.4</div>
        </div>
      </div>

    </div>
  );
}
