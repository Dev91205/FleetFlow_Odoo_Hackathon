import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useFleet } from "./context/FleetContext";

// ── ICONS (inline SVG — no extra dependency) ─────────────────
const Icon = ({ name }) => {
  const icons = {
    dashboard: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    vehicles: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    trips: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/>
      </svg>
    ),
    maintenance: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    expenses: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    drivers: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    analytics: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    alerts: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    search: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    logout: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
    plus: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    chevron: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// ── ROLE BADGE COLORS ────────────────────────────────────────
const roleMeta = {
  manager:    { label: "Fleet Manager",      color: "var(--primary)"  },
  dispatcher: { label: "Dispatcher",         color: "var(--info)"     },
  safety:     { label: "Safety Officer",     color: "var(--warning)"  },
  analyst:    { label: "Financial Analyst",  color: "var(--text-secondary)" },
};

// ── NAV ITEMS PER ROLE ────────────────────────────────────────
const allNavItems = [
  { to: "/dashboard",   label: "Dashboard",     icon: "dashboard",   roles: ["manager","dispatcher","safety","analyst"] },
  { to: "/vehicles",    label: "Vehicle Registry", icon: "vehicles", roles: ["manager","dispatcher"] },
  { to: "/trips",       label: "Trip Dispatcher",  icon: "trips",    roles: ["manager","dispatcher"] },
  { to: "/maintenance", label: "Maintenance",    icon: "maintenance", roles: ["manager","safety"] },
  { to: "/expenses",    label: "Trip & Expenses",  icon: "expenses", roles: ["manager","analyst","dispatcher"] },
  { to: "/drivers",     label: "Driver Profiles",  icon: "drivers",  roles: ["manager","safety"] },
  { to: "/analytics",   label: "Analytics",     icon: "analytics",   roles: ["manager","analyst"] },
  { to: "/alerts",      label: "Alert Center",  icon: "alerts",      roles: ["manager","dispatcher","safety","analyst"] },
];

// ── SIDEBAR ───────────────────────────────────────────────────
const Sidebar = ({ user, alertCount, onLogout }) => {
  const meta = roleMeta[user?.role] || roleMeta.manager;
  const visibleNav = allNavItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        FLEET<span>FLOW</span>
      </div>

      {/* User card */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--primary-dim)",
          border: "1px solid var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--primary)",
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "var(--font-heading)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {user?.name}
          </div>
          <div style={{
            fontSize: "10px",
            fontWeight: 700,
            color: meta.color,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: 2,
          }}>
            {meta.label}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>

        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-icon">
              <Icon name={item.icon} />
            </span>
            {item.label}

            {/* Alert badge on Alert Center */}
            {item.to === "/alerts" && alertCount > 0 && (
              <span style={{
                marginLeft: "auto",
                background: "var(--danger)",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "100px",
                minWidth: 18,
                textAlign: "center",
              }}>
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={onLogout}
          className="btn btn--ghost"
          style={{ width: "100%", justifyContent: "flex-start", gap: 10 }}
        >
          <Icon name="logout" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

// ── TOPBAR ────────────────────────────────────────────────────
const Topbar = ({ user, alertCount, onAlertClick }) => {
  const navigate = useNavigate();

  return (
    <header className="topbar">

      {/* Search */}
      <div className="topbar-search">
        <span style={{
          position: "absolute",
          left: 11,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-dim)",
          pointerEvents: "none",
          display: "flex",
        }}>
          <Icon name="search" />
        </span>
        <input placeholder="Search vehicles, trips, drivers..." />
      </div>

      {/* Right actions */}
      <div className="topbar-actions">

        {/* New Vehicle quick action */}
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => navigate("/vehicles")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="plus" />
          New Vehicle
        </button>

        {/* New Trip quick action */}
        <button
          className="btn btn--primary btn--sm"
          onClick={() => navigate("/trips")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="plus" />
          New Trip
        </button>

        {/* Alert bell */}
        <button
          className="alert-bell"
          onClick={onAlertClick}
          title="Alert Center"
        >
          <Icon name="alerts" />
          {alertCount > 0 && (
            <span className="alert-badge">{alertCount > 9 ? "9+" : alertCount}</span>
          )}
        </button>

        {/* User avatar */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--primary-dim)",
          border: "1px solid var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--primary)",
          cursor: "default",
          flexShrink: 0,
        }}
          title={user?.name}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

// ── APP LAYOUT (shell) ────────────────────────────────────────
const AppLayout = () => {
  const { state, dispatch } = useFleet();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/", { replace: true });
  };

  const handleAlertClick = () => {
    navigate("/alerts");
  };

  const alertCount = state.alerts?.length || 0;

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <Sidebar
        user={state.currentUser}
        alertCount={alertCount}
        onLogout={handleLogout}
      />

      {/* Main area */}
      <div className="main-content">
        <Topbar
          user={state.currentUser}
          alertCount={alertCount}
          onAlertClick={handleAlertClick}
        />

        {/* Error toast from context */}
        {state._error && (
          <div style={{
            margin: "16px 32px 0",
            padding: "12px 20px",
            background: "var(--danger-dim)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            color: "var(--danger)",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            animation: "slideUp 200ms ease",
          }}>
            <span>⚠ {state._error}</span>
            <button
              onClick={() => dispatch({ type: "CLEAR_ERROR" })}
              style={{
                background: "none",
                border: "none",
                color: "var(--danger)",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: 1,
                padding: "0 4px",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="page-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
