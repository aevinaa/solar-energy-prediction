/**
 * Navbar.jsx
 * Shared across Dashboard, History, Settings.
 * Active tab is highlighted based on current URL.
 * Place at: src/components/Navbar.jsx
 */

import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, ChevronDown, LogOut, User, BarChart2, Settings } from "lucide-react";

const C = {
  bg:          "#0A0A07",
  amber:       "#F5A623",
  orange:      "#FF6835",
  cream:       "#F0ECD8",
  muted:       "#A89F88",
  mutedDark:   "#6E6A5A",
  border:      "rgba(245,166,35,0.12)",
  borderHover: "rgba(245,166,35,0.30)",
};

export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();          // gives us the current URL path
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Read user info from localStorage (set by backend on login)
  const name  = localStorage.getItem("name")  || "User";
  const email = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const NAV = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "History",   path: "/history"   },
    { label: "Settings",  path: "/settings"  },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      height:"68px", display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 5%",
      background:"rgba(10,10,7,0.88)",
      backdropFilter:"blur(24px)",
      borderBottom:`1px solid ${C.border}`,
    }}>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}
        onClick={() => navigate("/dashboard")}>
        <div style={{
          width:34, height:34, borderRadius:"50%",
          background:`radial-gradient(circle at 40% 35%, #FFE580, ${C.amber} 55%, ${C.orange})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 16px rgba(245,166,35,0.4)`,
        }}>
          <Sun size={16} color={C.bg} strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"17px", color:C.cream }}>
          Sun<span style={{ color:C.amber }}>Insight</span>
        </span>
      </div>

      {/* Nav links — active tab highlighted with amber underline */}
      <div style={{ display:"flex", gap:"28px" }}>
        {NAV.map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <span key={label}
              onClick={() => navigate(path)}
              style={{
                fontSize:"14px", fontWeight:500, cursor:"pointer",
                color:      active ? C.cream  : C.muted,
                borderBottom: active ? `2px solid ${C.amber}` : "2px solid transparent",
                paddingBottom:"4px",
                transition:"color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = C.cream; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = C.muted; }}
            >{label}</span>
          );
        })}
      </div>

      {/* Profile dropdown */}
      <div ref={ref} style={{ position:"relative" }}>
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            display:"flex", alignItems:"center", gap:"10px",
            background:"rgba(245,166,35,0.06)",
            border:`1px solid ${C.border}`,
            borderRadius:"100px", padding:"6px 14px 6px 6px",
            cursor:"pointer", color:C.cream,
            fontFamily:"'Outfit',sans-serif",
            transition:"all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderHover; e.currentTarget.style.background="rgba(245,166,35,0.10)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border;      e.currentTarget.style.background="rgba(245,166,35,0.06)"; }}
        >
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:`linear-gradient(135deg, ${C.amber}, ${C.orange})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"12px", fontWeight:700, color:C.bg,
          }}>{initials}</div>
          <span style={{ fontSize:"14px", fontWeight:500 }}>{name.split(" ")[0]}</span>
          <ChevronDown size={14} color={C.muted}
            style={{ transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0deg)" }} />
        </button>

        {open && (
          <div style={{
            position:"absolute", top:"calc(100% + 10px)", right:0,
            background:"#1A1A16",
            border:`1px solid ${C.border}`,
            borderRadius:"16px", padding:"8px", minWidth:"210px",
            zIndex:200, boxShadow:"0 16px 48px rgba(0,0,0,0.6)",
          }}>
            {/* User info */}
            <div style={{ padding:"10px 14px 14px", borderBottom:`1px solid ${C.border}`, marginBottom:"6px" }}>
              <div style={{ fontSize:"14px", fontWeight:600, color:C.cream }}>{name}</div>
              <div style={{ fontSize:"12px", color:C.mutedDark, marginTop:"2px" }}>{email}</div>
            </div>

            {[
              { icon:<User size={15}/>,     label:"My Account", path:"/settings"  },
              { icon:<BarChart2 size={15}/>, label:"My Predictions", path:"/history" },
              { icon:<Settings size={15}/>, label:"Settings",    path:"/settings"  },
            ].map(item => (
              <button key={item.label}
                onClick={() => { navigate(item.path); setOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", borderRadius:"10px", cursor:"pointer", fontSize:"14px", color:C.muted, transition:"all 0.18s", border:"none", background:"none", width:"100%", fontFamily:"'Outfit',sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(245,166,35,0.07)"; e.currentTarget.style.color=C.cream; }}
                onMouseLeave={e => { e.currentTarget.style.background="none";                   e.currentTarget.style.color=C.muted; }}
              >{item.icon}{item.label}</button>
            ))}

            <div style={{ borderTop:`1px solid ${C.border}`, margin:"6px 0" }} />
            <button onClick={handleLogout}
              style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", borderRadius:"10px", cursor:"pointer", fontSize:"14px", color:C.muted, transition:"all 0.18s", border:"none", background:"none", width:"100%", fontFamily:"'Outfit',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,80,80,0.08)"; e.currentTarget.style.color="#ff7070"; }}
              onMouseLeave={e => { e.currentTarget.style.background="none";                  e.currentTarget.style.color=C.muted; }}
            ><LogOut size={15}/>Log Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}