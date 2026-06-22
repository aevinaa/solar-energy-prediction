/**
 * AuthPage.jsx
 * ─────────────────────────────────────────────────────
 * Handles both Login and Sign Up in one page.
 * Toggle between them using the tab bar at the top of the card.
 *
 * HOW IT WORKS:
 *  - `mode` state = "login" | "signup"
 *  - `showPass` / `showConfirm` = eye toggle for password fields
 *  - Left side: decorative solar visual (matches landing page vibe)
 *  - Right side: the form card
 *
 * FILE LOCATION: src/pages/AuthPage.jsx
 * ─────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { Sun, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

// Same colour tokens as LandingPage — keeps everything coordinated
const C = {
  bg:          "#0A0A07",
  card:        "#111110",
  amber:       "#F5A623",
  amberLight:  "#FFD07A",
  orange:      "#FF6835",
  cream:       "#F0ECD8",
  muted:       "#A89F88",
  mutedDark:   "#6E6A5A",
  border:      "rgba(245,166,35,0.12)",
  borderHover: "rgba(245,166,35,0.30)",
};

export default function AuthPage() {
  useEffect(() => {
    console.log("Component mounted");
  }, []);
  // "login" or "signup" — controls which form is shown
  const [mode, setMode] = useState("login");

  // Password visibility toggles
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Form field state
  const [form, setForm] = useState({
    name:     "",
    email:    "",
    password: "",
    confirm:  "",
    remember: false,
  });

  // Generic field updater — works for any input
  const update = (field) => (e) =>
    setForm(prev => ({
      ...prev,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // When switching tabs, clear all fields + reset eye toggles
  const switchMode = (newMode) => {
    setMode(newMode);
    setShowPass(false);
    setShowConfirm(false);
    setForm({ name:"", email:"", password:"", confirm:"", remember:false });
  };

  // Placeholder submit — wire up your backend here later
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED");

    try {
      if (mode === "login") {
        const response = await fetch("https://solar-energy-prediction-ny8f.onrender.com/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: form.email, 
            password: form.password
          })
        });

        if (!response.ok) {
          const err = await response.json();
          console.log("LOGIN ERROR:", err);
          alert("Login failed");
          return;
        }

        const data = await response.json();
        console.log("LOGIN RESPONSE:", data);

        if (data.user_id!== undefined) {
          localStorage.setItem("user_id", data.user_id);
          localStorage.setItem("name", data.name);
          localStorage.setItem("email", data.email);
          console.log("Saved name:", data.name);
          console.log("Saved email:", data.email);
          navigate("/dashboard");

          //window.location.href = "/dashboard";
        } else {
          alert("Invalid credentials");
        }
      }

      else {
        const response = await fetch("https://solar-energy-prediction-ny8f.onrender.com/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password
          })
        });

        alert("Signup successful!");
        setMode("login");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      minHeight:   "100vh",
      background:  C.bg,
      display:     "flex",
      fontFamily:  "'Outfit', sans-serif",
      color:       C.cream,
      overflowX:   "hidden",
    }}>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ════════════════════════════════════════════
           LEFT PANEL — decorative, matches landing vibe
           Hidden on smaller screens.
        ════════════════════════════════════════════ */}
      <div style={{
        flex:       "1 1 50%",
        display:    "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding:    "60px 40px",
        position:   "relative",
        overflow:   "hidden",
        // Only show on wide screens
        "@media(max-width:768px)": { display:"none" },
      }} className="auth-left-panel">

        {/* Big ambient amber glow in the centre-left */}
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:500, height:500,
          background:"radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)",
          pointerEvents:"none",
        }} />


        {/* Sun orb */}
        <div style={{
          width:200, height:200, borderRadius:"50%",
          background:"radial-gradient(circle at 38% 32%, #FFD966 0%, #F5A623 45%, #D4631A 75%, #8B3300 100%)",
          boxShadow:"0 0 80px rgba(245,166,35,0.5), 0 0 160px rgba(245,166,35,0.25), inset 0 0 40px rgba(255,80,0,0.4)",
          marginBottom:"60px",
          position:"relative", zIndex:1,
        }} />

        {/* Tagline */}
        <div style={{ textAlign:"center", position:"relative", zIndex:1, maxWidth:340 }}>
          <h2 style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:"clamp(26px, 3vw, 38px)",
            lineHeight:1.1, marginBottom:"16px",
          }}>
            Your solar future,<br />
            <span style={{ color:C.amber }}>predicted.</span>
          </h2>
          <p style={{ color:C.muted, fontSize:"15px", lineHeight:1.75 }}>
            Join SunInsight and get accurate solar generation forecasts
            tailored to your location and system.
          </p>
        </div>

        {/* Small trust badge at the bottom */}
        <div style={{
          position:"absolute", bottom:"40px", left:"50%", transform:"translateX(-50%)",
          display:"inline-flex", alignItems:"center", gap:"10px",
          background:"rgba(245,166,35,0.06)",
          border:`1px solid ${C.border}`,
          borderRadius:"100px", padding:"10px 20px",
          whiteSpace:"nowrap",
        }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.amber, boxShadow:`0 0 8px ${C.amber}` }} />
          <span style={{ fontSize:"13px", color:C.muted }}>93% forecast accuracy · trusted by solar users</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════
           RIGHT PANEL — the actual form
        ════════════════════════════════════════════ */}
      <div style={{
        flex:            "1 1 50%",
        display:         "flex",
        flexDirection:   "column",
        justifyContent:  "center",
        alignItems:      "center",
        padding:         "48px 32px",
        position:        "relative",
        // Subtle left border separating panels
        borderLeft:      `1px solid ${C.border}`,
      }}>

        {/* Back to home link — top left */}
        <a href="/" style={{
          position:"absolute", top:"20px", left:"20px",
          display:"flex", alignItems:"center", gap:"8px",
          color:C.cream, fontSize:"15px", fontWeight:500, textDecoration:"none",
          transition:"color 0.2s",
          padding:"10px 16px",
          borderRadius:"12px",
          border:`1px solid ${C.border}`,
          backgroundColor:"rgba(245,166,35,0.08)",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.color = C.amber;
            e.currentTarget.style.backgroundColor = "rgba(245,166,35,0.15)";
            e.currentTarget.style.borderColor = "rgba(245,166,35,0.35)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = C.cream;
            e.currentTarget.style.backgroundColor = "rgba(245,166,35,0.08)";
            e.currentTarget.style.borderColor = C.border;
          }}
        >
          <ArrowLeft size={18} /> Back to home
        </a>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"36px" }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:`radial-gradient(circle at 40% 35%, #FFE580, ${C.amber} 55%, ${C.orange})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 18px rgba(245,166,35,0.4)`,
          }}>
            <Sun size={17} color={C.bg} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px" }}>
            Sun<span style={{ color:C.amber }}>Insight</span>
          </span>
        </div>

        {/* Form card */}
        <div className="auth-card" style={{
          width:"100%", maxWidth:"400px",
          background:  C.card,
          border:      `1px solid ${C.border}`,
          borderRadius:"24px",
          padding:     "36px",
        }}>

          {/* ── Tab toggle ── */}
          <div className="auth-tab-bar">
            <button
              type="button"
              className={`auth-tab${mode === "login"  ? " active" : ""}`}
              onClick={() => switchMode("login")}
            >Log In</button>
            <button
              type="button"
              className={`auth-tab${mode === "signup" ? " active" : ""}`}
              onClick={() => switchMode("signup")}
            >Sign Up</button>
          </div>

          {/* ── Heading ── */}
          <h1 style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:"26px", marginBottom:"6px",
          }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color:"#C4B8A3", fontSize:"14px", marginBottom:"28px" }}>
            {mode === "login"
              ? "Enter your details to access your dashboard."
              : "Start forecasting your solar generation today."}
          </p>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

            {/* Name — signup only */}
            {mode === "signup" && (
              <div>
                <label style={{ fontSize:"13px", fontWeight:500, color:"#C4B8A3", display:"block", marginBottom:"7px" }}>
                  Full Name
                </label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Dhiya Sampath Kumar"
                  value={form.name}
                  onChange={update("name")}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize:"13px", fontWeight:500, color:"#C4B8A3", display:"block", marginBottom:"7px" }}>
                Email Address
              </label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize:"13px", fontWeight:500, color:"#C4B8A3", display:"block", marginBottom:"7px" }}>
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                  value={form.password}
                  onChange={update("password")}
                  required
                />
                {/* Eye toggle button */}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password — signup only */}
            {mode === "signup" && (
              <div>
                <label style={{ fontSize:"13px", fontWeight:500, color:"#C4B8A3", display:"block", marginBottom:"7px" }}>
                  Confirm Password
                </label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={update("confirm")}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirm(p => !p)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember me + Forgot password — login only */}
            {mode === "login" && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", color:"#C4B8A3", cursor:"pointer" }}>
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={form.remember}
                    onChange={update("remember")}
                  />
                  Remember me
                </label>
                <span style={{ fontSize:"13px", color:C.amber, cursor:"pointer", transition:"opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Forgot password?
                </span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="auth-btn" onClick={() => console.log("BUTTON CLICKED")} style={{ marginTop:"4px" }}>
              {mode === "login" ? "Log In" : "Create Account"}
            </button>

          </form>

          {/* Switch mode link at the bottom */}
          <p style={{ textAlign:"center", marginTop:"24px", fontSize:"13px", color:"#C4B8A3" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              style={{ color:C.amber, cursor:"pointer", fontWeight:600 }}
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </span>
          </p>

        </div>{/* end card */}
      </div>{/* end right panel */}
    </div>
  );
}