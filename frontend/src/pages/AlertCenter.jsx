import { useNavigate } from "react-router-dom";
import { useFleet } from "../context/FleetContext";

// ── ICONS ─────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const LicenseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
    <path d="M6 15h4M14 15h4"/>
  </svg>
);

const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);

const TripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/>
  </svg>
);

const DismissIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── HELPERS ───────────────────────────────────────────────────
// Map each alert type → visual config
const typeConfig = {
  critical: {
    itemClass:  "alert-item alert-item--critical",
    dotClass:   "alert-dot alert-dot--critical",
    color:      "var(--danger)",
    dimColor:   "var(--danger-dim)",
    label:      "CRITICAL",
    pillClass:  "pill--suspended",
  },
  warning: {
    itemClass:  "alert-item alert-item--warning",
    dotClass:   "alert-dot alert-dot--warning",
    color:      "var(--warning)",
    dimColor:   "var(--warning-dim)",
    label:      "WARNING",
    pillClass:  "pill--in-shop",
  },
  info: {
    itemClass:  "alert-item alert-item--info",
    dotClass:   "alert-dot alert-dot--info",
    color:      "var(--info)",
    dimColor:   "var(--info-dim)",
    label:      "INFO",
    pillClass:  "pill--on-trip",
  },
};

// Category icon component
const CategoryIcon = ({ category }) => {
  if (category === "license")     return <LicenseIcon />;
  if (category === "maintenance") return <WrenchIcon />;
  if (category === "trip")        return <TripIcon />;
  return null;
};

// One-click action → where it navigates
const actionRoute = {
  "Suspend Driver":    "/drivers",
  "Renew License":     "/drivers",
  "Schedule Service":  "/maintenance",
  "Dispatch Now":      "/trips",
};

// ── EMPTY STATE ───────────────────────────────────────────────
const AllClearState = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 40px",
    gap: 16,
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
  }}>
    <div style={{ opacity: 0.15 }}><BellIcon /></div>
    <div style={{
      fontFamily: "var(--font-heading)",
      fontSize: "var(--text-lg)",
      fontWeight: 700,
      color: "var(--primary)",
    }}>
      All Clear
    </div>
    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", textAlign: "center", maxWidth: 320 }}>
      No active alerts. All driver licenses are valid, vehicles are within service intervals, and no trips are stalled.
    </div>
  </div>
);

// ── ALERT CARD ────────────────────────────────────────────────
const AlertCard = ({ alert, onDismiss, onAction }) => {
  const cfg = typeConfig[alert.type] || typeConfig.info;

  return (
    <div className={cfg.itemClass} style={{ animationFillMode: "both" }}>

      {/* Left dot */}
      <div className={cfg.dotClass} />

      {/* Category icon */}
      <div style={{
        width: 34,
        height: 34,
        borderRadius: "var(--radius-md)",
        background: cfg.dimColor,
        border: `1px solid ${cfg.color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: cfg.color,
        flexShrink: 0,
      }}>
        <CategoryIcon category={alert.category} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          {/* Urgency pill */}
          <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 9 }}>
            {cfg.label}
          </span>
          {/* Category tag */}
          <span style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            {alert.category}
          </span>
        </div>

        {/* Main message */}
        <div style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 3,
        }}>
          {alert.message}
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-secondary)",
        }}>
          {alert.subtext}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={() => onAction(alert)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          background: cfg.dimColor,
          border: `1px solid ${cfg.color}`,
          borderRadius: "var(--radius-md)",
          color: cfg.color,
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "none"; }}
      >
        {alert.action}
        <ArrowIcon />
      </button>

      {/* Dismiss × */}
      <button
        onClick={() => onDismiss(alert.id)}
        title="Dismiss alert"
        style={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-dim)",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.color = "var(--danger)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
      >
        <DismissIcon />
      </button>
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────
const AlertCenter = () => {
  const { state, dispatch } = useFleet();
  const navigate = useNavigate();

  const alerts = state.alerts || [];

  // ── Counts per type ───────────────────────────────────────
  const criticalCount    = alerts.filter((a) => a.type === "critical").length;
  const warningCount     = alerts.filter((a) => a.type === "warning").length;
  const infoCount        = alerts.filter((a) => a.type === "info").length;

  // ── Group alerts: critical first, then warning, then info ─
  const sorted = [
    ...alerts.filter((a) => a.type === "critical"),
    ...alerts.filter((a) => a.type === "warning"),
    ...alerts.filter((a) => a.type === "info"),
  ];

  // ── Group by category for the section headers ─────────────
  const licenseAlerts     = sorted.filter((a) => a.category === "license");
  const maintenanceAlerts = sorted.filter((a) => a.category === "maintenance");
  const tripAlerts        = sorted.filter((a) => a.category === "trip");

  const groups = [
    { key: "license",     label: "License Alerts",     icon: <LicenseIcon />, color: "var(--danger)",  items: licenseAlerts     },
    { key: "maintenance", label: "Maintenance Alerts",  icon: <WrenchIcon />,  color: "var(--warning)", items: maintenanceAlerts  },
    { key: "trip",        label: "Trip Alerts",         icon: <TripIcon />,    color: "var(--info)",    items: tripAlerts         },
  ].filter((g) => g.items.length > 0);

  const handleDismiss = (alertId) => {
    dispatch({ type: "DISMISS_ALERT", payload: alertId });
  };

  const handleAction = (alert) => {
    const route = actionRoute[alert.action] || "/dashboard";
    navigate(route);
  };

  const handleDismissAll = () => {
    alerts.forEach((a) => dispatch({ type: "DISMISS_ALERT", payload: a.id }));
  };

  const summaryStats = [
    { label: "Total Alerts",   value: alerts.length,  color: "var(--text-primary)"  },
    { label: "Critical",       value: criticalCount,  color: "var(--danger)"         },
    { label: "Warnings",       value: warningCount,   color: "var(--warning)"        },
    { label: "Info",           value: infoCount,      color: "var(--info)"           },
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-subtitle">Proactive fleet health — license expiry, service intervals, stalled trips</p>
        </div>
        {alerts.length > 0 && (
          <button
            className="btn btn--ghost"
            onClick={handleDismissAll}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <DismissIcon />
            Dismiss All
          </button>
        )}
      </div>

      {/* ── KPI Row ──────────────────────────────────────────── */}
      <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
        {summaryStats.map((s) => (
          <div key={s.label} style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderLeft: `3px solid ${s.color}`,
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── How It Works Banner ──────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--primary)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 20px",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Alerts are <strong style={{ color: "var(--primary)" }}>auto-generated</strong> from live fleet data —
          driver licenses expiring within <strong style={{ color: "var(--warning)" }}>30 days</strong>,
          vehicles within <strong style={{ color: "var(--warning)" }}>1,000 km</strong> of their service milestone,
          and trips stuck in <strong style={{ color: "var(--info)" }}>Draft</strong> status.
          Click the action button to resolve each item directly.
        </div>
      </div>

      {/* ── Alert Groups or Empty State ──────────────────────── */}
      {alerts.length === 0 ? (
        <AllClearState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {groups.map((group) => (
            <div key={group.key}>

              {/* Section header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                paddingBottom: 12,
                borderBottom: `1px solid var(--border)`,
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-md)",
                  background: `${group.color}15`,
                  border: `1px solid ${group.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: group.color,
                  flexShrink: 0,
                }}>
                  {group.icon}
                </div>
                <div style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}>
                  {group.label}
                </div>
                <span style={{
                  marginLeft: 4,
                  background: `${group.color}20`,
                  border: `1px solid ${group.color}`,
                  color: group.color,
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                }}>
                  {group.items.length}
                </span>
                <div style={{ marginLeft: "auto", height: 1, flex: 1, background: "var(--border)" }} />
              </div>

              {/* Alert cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.items.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer note ──────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div style={{
          marginTop: 28,
          padding: "12px 20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
            {alerts.length} active alert{alerts.length !== 1 ? "s" : ""} · Alerts regenerate automatically when fleet data changes
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "View Drivers",     path: "/drivers",     color: "var(--danger)"  },
              { label: "Maintenance Logs", path: "/maintenance", color: "var(--warning)" },
              { label: "Trip Dispatcher",  path: "/trips",       color: "var(--info)"    },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: "6px 14px",
                  background: "transparent",
                  border: `1px solid var(--border)`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.color = item.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                {item.label} →
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
