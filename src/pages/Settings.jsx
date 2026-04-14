/**
 * Settings.jsx
 * Reads name + email from localStorage.
 * Logout clears localStorage and redirects to /login.
 * Place at: src/pages/Settings.jsx
 */

import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Shield } from "lucide-react";
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
};

export default function Settings() {
  const navigate = useNavigate();

  const name  = localStorage.getItem("name")  || "User";
  const email = localStorage.getItem("email") || "—";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.cream, fontFamily:"'Outfit',sans-serif", position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes grid-drift { 0%,100% { opacity:0.18; } 50% { opacity:0.32; } }
        @keyframes pulse-soft { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0.9; transform:scale(1.04); } }
      `}</style>

      {/* Background decorations */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", backgroundImage:"radial-gradient(rgba(245,166,35,0.09) 1px, transparent 1px)", backgroundSize:"36px 36px", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)" }} />
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-5%", left:"-5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,104,53,0.04) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      {/* Ring cluster */}
      <div style={{ position:"fixed", top:"8%", right:"3%", pointerEvents:"none", zIndex:0, opacity:0.6 }}>
        {[60,100,140,180].map((r,i) => (
          <div key={r} style={{ position:"absolute", top:"50%", left:"50%", width:r*2, height:r*2, transform:"translate(-50%,-50%)", borderRadius:"50%", border:`1px solid rgba(245,166,35,${0.10-i*0.018})`, animation:`grid-drift ${3+i*0.8}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
        ))}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:26, height:26, borderRadius:"50%", background:"radial-gradient(circle at 40% 35%, #FFD966, #F5A623 55%, #D4631A)", boxShadow:"0 0 20px rgba(245,166,35,0.5)", animation:"pulse-soft 4s ease-in-out infinite" }} />
      </div>

      <div style={{ position:"relative", zIndex:1 }}>
        <Navbar />

        <main style={{ padding:"60px 5%", maxWidth:680, margin:"0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom:"48px", animation:"fade-up 0.6s ease-out both" }}>
            <div style={{ display:"inline-block", background:"rgba(245,166,35,0.09)", border:`1px solid rgba(245,166,35,0.22)`, color:C.amber, fontSize:"11px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"6px 14px", borderRadius:"100px", marginBottom:"16px" }}>
              Account Settings
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,46px)", lineHeight:1.08 }}>
              Your <span style={{ color:C.amber }}>account.</span>
            </h1>
          </div>

          {/* ── Profile card ── */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"22px", padding:"36px", marginBottom:"20px", position:"relative", overflow:"hidden", animation:"fade-up 0.6s 0.1s ease-out both" }}>
            <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"40%", height:"2px", background:`linear-gradient(90deg, transparent, ${C.amber}, transparent)` }} />
            <div style={{ position:"absolute", bottom:-50, right:-50, width:160, height:160, borderRadius:"50%", border:`1px solid rgba(245,166,35,0.07)`, pointerEvents:"none" }} />

            <div style={{ fontSize:"13px", fontWeight:600, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"22px" }}>
              Profile
            </div>

            {/* Avatar + name row */}
            <div style={{ display:"flex", alignItems:"center", gap:"18px", marginBottom:"32px" }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:`linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"22px", fontWeight:800, color:C.bg,
                boxShadow:`0 0 24px rgba(245,166,35,0.35)`,
                flexShrink:0,
              }}>{initials}</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"20px", color:C.cream }}>{name}</div>
                <div style={{ fontSize:"13px", color:C.muted, marginTop:"3px" }}>SunInsight user</div>
              </div>
            </div>

            {/* Info rows */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {/* Full Name */}
              <div style={{ display:"flex", alignItems:"center", gap:"14px", background:"rgba(245,166,35,0.04)", border:`1px solid rgba(245,166,35,0.10)`, borderRadius:"14px", padding:"16px 18px" }}>
                <div style={{ width:38, height:38, borderRadius:"10px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <User size={17} color={C.amber} />
                </div>
                <div>
                  <div style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"3px" }}>Full Name</div>
                  <div style={{ fontSize:"15px", fontWeight:500, color:C.cream }}>{name}</div>
                </div>
              </div>

              {/* Email */}
              <div style={{ display:"flex", alignItems:"center", gap:"14px", background:"rgba(245,166,35,0.04)", border:`1px solid rgba(245,166,35,0.10)`, borderRadius:"14px", padding:"16px 18px" }}>
                <div style={{ width:38, height:38, borderRadius:"10px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Mail size={17} color={C.amber} />
                </div>
                <div>
                  <div style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"3px" }}>Email Address</div>
                  <div style={{ fontSize:"15px", fontWeight:500, color:C.cream }}>{email}</div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Security section ── */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"22px", padding:"36px", marginBottom:"20px", position:"relative", overflow:"hidden", animation:"fade-up 0.6s 0.2s ease-out both" }}>
            <div style={{ fontSize:"13px", fontWeight:600, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"22px" }}>
              Security
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"14px", background:"rgba(245,166,35,0.04)", border:`1px solid rgba(245,166,35,0.10)`, borderRadius:"14px", padding:"16px 18px" }}>
              <div style={{ width:38, height:38, borderRadius:"10px", background:"rgba(245,166,35,0.09)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Shield size={17} color={C.amber} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"11px", color:C.mutedDark, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"3px" }}>Password</div>
                <div style={{ fontSize:"15px", fontWeight:500, color:C.cream }}>••••••••</div>
              </div>
              <span style={{ fontSize:"13px", color:C.amber, cursor:"pointer", fontWeight:600 }}
                onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >Change</span>
            </div>
          </div>

          {/* ── Logout ── */}
          <div style={{ animation:"fade-up 0.6s 0.3s ease-out both" }}>
            <button
              onClick={handleLogout}
              style={{
                width:"100%",
                background:"rgba(255,80,80,0.06)",
                border:"1px solid rgba(255,80,80,0.18)",
                borderRadius:"16px",
                padding:"18px",
                color:"#ff7070",
                fontFamily:"'Outfit',sans-serif",
                fontSize:"15px",
                fontWeight:600,
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:"10px",
                transition:"all 0.22s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,80,80,0.12)"; e.currentTarget.style.borderColor="rgba(255,80,80,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,80,80,0.06)"; e.currentTarget.style.borderColor="rgba(255,80,80,0.18)"; }}
            >
              <LogOut size={17} /> Log Out
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}