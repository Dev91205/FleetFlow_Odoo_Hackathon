import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFleet } from "../context/FleetContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const roles = [
  { value: "manager",    label: "Fleet Manager",    desc: "Full system access"    },
  { value: "dispatcher", label: "Dispatcher",        desc: "Trips & vehicles"      },
  { value: "safety",     label: "Safety Officer",    desc: "Drivers & maintenance" },
  { value: "analyst",    label: "Financial Analyst", desc: "Expenses & analytics"  },
];

// Demo credentials — seeded in schema.sql
const mockAccounts = [
  { email: "manager@fleetflow.com",    password: "fleet123", name: "Arjun Sharma",  role: "manager"    },
  { email: "dispatcher@fleetflow.com", password: "fleet123", name: "Kiran Desai",   role: "dispatcher" },
  { email: "safety@fleetflow.com",     password: "fleet123", name: "Meera Iyer",    role: "safety"     },
  { email: "analyst@fleetflow.com",    password: "fleet123", name: "Rohit Verma",   role: "analyst"    },
];

const roleColors = {
  manager:    "var(--primary)",
  dispatcher: "var(--info)",
  safety:     "var(--warning)",
  analyst:    "var(--text-secondary)",
};

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useFleet();

  const [loginForm, setLoginForm]     = useState({ email: "", password: "" });
  const [loginError, setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [regForm, setRegForm]         = useState({ name: "", email: "", password: "", role: "dispatcher" });
  const [regError, setRegError]       = useState("");
  const [regLoading, setRegLoading]   = useState(false);
  const [showRegPw, setShowRegPw]     = useState(false);
  const [selectedRole, setSelectedRole] = useState("dispatcher");

  // ── LOGIN ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please fill in all fields.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:    loginForm.email.trim().toLowerCase(),
          password: loginForm.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Invalid email or password.");
        return;
      }

      // dispatch LOGIN with { token, user } — FleetContext stores both
      await dispatch({ type: "LOGIN", payload: { token: data.token, ...data.user } });
      navigate("/dashboard", { replace: true });

    } catch (err) {
      // Network error — fall back to demo accounts for offline demo
      const account = mockAccounts.find(
        (a) => a.email === loginForm.email && a.password === loginForm.password
      );
      if (account) {
        await dispatch({
          type: "LOGIN",
          payload: { token: "demo_token", id: account.role, name: account.name, role: account.role },
        });
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError("Cannot reach server. Use demo credentials to continue offline.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");

    if (!regForm.name || !regForm.email || !regForm.password) {
      setRegError("All fields are required.");
      return;
    }
    if (regForm.password.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(regForm.email)) {
      setRegError("Enter a valid email address.");
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     regForm.name.trim(),
          email:    regForm.email.trim().toLowerCase(),
          password: regForm.password,
          role:     selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Registration failed. Try again.");
        return;
      }

      await dispatch({ type: "LOGIN", payload: { token: data.token, ...data.user } });
      navigate("/dashboard", { replace: true });

    } catch (err) {
      // Offline fallback
      await dispatch({
        type: "LOGIN",
        payload: { token: "demo_token", id: "local", name: regForm.name, role: selectedRole },
      });
      navigate("/dashboard", { replace: true });
    } finally {
      setRegLoading(false);
    }
  };

  const fillDemo = (account) => {
    setLoginForm({ email: account.email, password: account.password });
    setLoginError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: "60px 60px", opacity: 0.3, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "20%", left: "25%",
        width: 500, height: 500,
        background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64, borderBottom: "1px solid var(--border)",
      }}>
        <button onClick={() => navigate("/")} style={{
          fontFamily: "var(--font-display)", fontSize: 22,
          letterSpacing: "0.06em", color: "var(--primary)",
          background: "none", border: "none", cursor: "pointer",
        }}>
          FLEET<span style={{ color: "var(--text-secondary)" }}>FLOW</span>
        </button>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Secure Access Portal
        </span>
      </nav>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", zIndex: 1 }}>

        {/* ── LOGIN PANEL ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 56px", borderRight: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 400, width: "100%" }}>

            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
                Welcome Back
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                Sign in to your account
              </h1>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input" type="email"
                  placeholder="you@fleetflow.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type={showLoginPw ? "text" : "password"}
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    style={{ paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", display: "flex",
                  }}>
                    <EyeIcon open={showLoginPw} />
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={{ padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid var(--danger)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontSize: "var(--text-xs)", fontWeight: 500 }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={loginLoading}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {loginLoading ? "Signing in..." : "Sign In →"}
              </button>

            </form>

            {/* Demo credentials */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: "var(--text-xs)", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                Demo Credentials
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mockAccounts.map((a) => (
                  <button key={a.role} type="button" onClick={() => fillDemo(a)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "var(--bg-elevated)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                    cursor: "pointer", transition: "border-color 150ms ease", width: "100%",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = roleColors[a.role]}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: roleColors[a.role], textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginTop: 2 }}>{a.email}</div>
                    </div>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", fontStyle: "italic" }}>click to fill</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── REGISTER PANEL ─────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 56px", background: "var(--bg-surface)" }}>
          <div style={{ maxWidth: 420, width: "100%" }}>

            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--info)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
                New User
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                Create your account
              </h1>
            </div>

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Your full name"
                  value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@company.in"
                  value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input className="form-input" type={showRegPw ? "text" : "password"}
                    placeholder="Min. 6 characters" value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowRegPw(!showRegPw)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", display: "flex",
                  }}>
                    <EyeIcon open={showRegPw} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Role</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {roles.map((r) => (
                    <button key={r.value} type="button" onClick={() => setSelectedRole(r.value)} style={{
                      padding: "12px 14px",
                      background: selectedRole === r.value ? `${roleColors[r.value]}15` : "var(--bg-base)",
                      border: `1px solid ${selectedRole === r.value ? roleColors[r.value] : "var(--border)"}`,
                      borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left", transition: "all 150ms ease",
                    }}>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: selectedRole === r.value ? roleColors[r.value] : "var(--text-primary)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-body)" }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {regError && (
                <div style={{ padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid var(--danger)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontSize: "var(--text-xs)", fontWeight: 500 }}>
                  {regError}
                </div>
              )}

              <button type="submit" className="btn btn--ghost" disabled={regLoading} style={{
                width: "100%", justifyContent: "center", marginTop: 4,
                borderColor: "var(--info)", color: "var(--info)",
              }}>
                {regLoading ? "Creating account..." : "Register & Enter FleetFlow →"}
              </button>

            </form>

            <div style={{ marginTop: 28, padding: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "3px solid var(--primary)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>Role Access Note — </span>
              Manager gets full access. Dispatcher manages trips and vehicles. Safety Officer handles drivers and maintenance. Analyst views expenses and analytics only.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
