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

  // Google SSO form state
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleForm, setGoogleForm] = useState({
    googleEmail: "",
  });

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
        const response = await fetch("http://solar-energy-prediction-ny8f.onrender.com/login", {
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
        const response = await fetch("http://solar-energy-prediction-ny8f.onrender.com/signup", {
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

            {/* Divider */}
            <div className="auth-divider">or continue with</div>

            {/* Google SSO — shows button or form based on state */}
            {!showGoogleForm ? (
              <button 
                type="button" 
                className="auth-google-btn"
                onClick={() => setShowGoogleForm(true)}
              >
                {/* Google "G" logo as inline SVG */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            ) : (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px",
                animation: "slideDown 0.3s ease-out"
              }}>
                <label style={{ fontSize:"13px", fontWeight:500, color:"#C4B8A3", display:"block" }}>
                  Google Account Email
                </label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={googleForm.googleEmail}
                  onChange={(e) => setGoogleForm({ googleEmail: e.target.value })}
                  autoFocus
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="auth-btn"
                    style={{ flex: 1, marginTop: 0 }}
                    onClick={() => {
                      console.log("Google SSO with:", googleForm);
                      // Backend connection can go here later
                    }}
                  >
                    Connect Google
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "11px 18px",
                      background: "rgba(245,166,35,0.08)",
                      border: `1px solid ${C.border}`,
                      borderRadius: "12px",
                      color: C.cream,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(245,166,35,0.15)";
                      e.currentTarget.style.borderColor = C.borderHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(245,166,35,0.08)";
                      e.currentTarget.style.borderColor = C.border;
                    }}
                    onClick={() => {
                      setShowGoogleForm(false);
                      setGoogleForm({ googleEmail: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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