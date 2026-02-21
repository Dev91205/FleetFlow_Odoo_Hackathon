import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFleet, selectKPIs } from "../context/FleetContext";

const useCountUp = (target, duration = 1500, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const statusPillMap = {
  "On Trip":   { cls: "pill pill--on-trip",   label: "On Trip"   },
  "Dispatched":{ cls: "pill pill--on-trip",   label: "Dispatched"},
  "Completed": { cls: "pill pill--done",       label: "Completed" },
  "Draft":     { cls: "pill pill--idle",       label: "Draft"     },
  "Cancelled": { cls: "pill pill--suspended",  label: "Cancelled" },
};

const vehicleStatusMap = {
  "Available": { cls: "pill pill--available", label: "Available" },
  "On Trip":   { cls: "pill pill--on-trip",   label: "On Trip"   },
  "In Shop":   { cls: "pill pill--in-shop",   label: "In Shop"   },
  "Idle":      { cls: "pill pill--idle",       label: "Idle"      },
};

const KpiCard = ({ label, value, sub, variant, started }) => {
  const count = useCountUp(typeof value === "number" ? value : 0, 1400, started);
  const display = typeof value === "number" ? count : value;

  const variantStyles = {
    default: { borderColor: "var(--primary)",  valueColor: "var(--primary)"  },
    warning: { borderColor: "var(--warning)",  valueColor: "var(--warning)"  },
    danger:  { borderColor: "var(--danger)",   valueColor: "var(--danger)"   },
    info:    { borderColor: "var(--info)",     valueColor: "var(--info)"     },
  };

  const s = variantStyles[variant || "default"];

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${s.borderColor}`,
      borderRadius: "var(--radius-lg)",
      padding: "24px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      transition: "box-shadow 250ms ease",
      cursor: "default",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 24px ${s.borderColor}20`}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(32px, 3vw, 44px)",
        color: s.valueColor,
        lineHeight: 1,
      }}>
        {typeof value === "number" ? display : value}
        {variant === "default" && typeof value === "number" && label.toLowerCase().includes("rate") ? "%" : ""}
      </div>
      {sub && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
          {sub}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { state, dispatch } = useFleet();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const kpis = selectKPIs(state);

  const driverMap = Object.fromEntries(state.drivers.map((d) => [d.id, d.name]));
  const vehicleMap = Object.fromEntries(state.vehicles.map((v) => [v.id, `${v.model} · ${v.plate}`]));

  const filteredTrips = state.trips.filter((t) => {
    const matchSearch =
      vehicleMap[t.vehicleId]?.toLowerCase().includes(search.toLowerCase()) ||
      driverMap[t.driverId]?.toLowerCase().includes(search.toLowerCase()) ||
      t.origin?.toLowerCase().includes(search.toLowerCase()) ||
      t.destination?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const recentAlerts = state.alerts.slice(0, 3);

  const tripStatuses = ["All", "Dispatched", "On Trip", "Completed", "Draft", "Cancelled"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 6,
            fontWeight: 500,
          }}>
            Command Center
          </div>
          <h1 className="page-title">Fleet Dashboard</h1>
          <p className="page-subtitle">
            Live overview of your entire fleet operation
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate("/vehicles")}>
            + New Vehicle
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => navigate("/trips")}>
            + New Trip
          </button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
      }}
        className="stagger"
      >
        <KpiCard
          label="Active Fleet"
          value={kpis.activeFleet}
          sub="vehicles currently on trip"
          variant="default"
          started={started}
        />
        <KpiCard
          label="Maintenance Alerts"
          value={kpis.maintenanceAlert}
          sub="vehicles in shop"
          variant="warning"
          started={started}
        />
        <KpiCard
          label="Utilization Rate"
          value={kpis.utilizationRate}
          sub={`${state.vehicles.length} total vehicles`}
          variant="info"
          started={started}
        />
        <KpiCard
          label="Pending Cargo"
          value={kpis.pendingCargo}
          sub="trips awaiting dispatch"
          variant="danger"
          started={started}
        />
      </div>

      {recentAlerts.length > 0 && (
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--warning)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--warning)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--warning)",
                display: "inline-block",
                animation: "pulse-info 2s infinite",
              }} />
              Active Alerts ({state.alerts.length})
            </div>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => navigate("/alerts")}
            >
              View All →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentAlerts.map((alert, i) => (
              <div
                key={alert.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderBottom: i < recentAlerts.length - 1 ? "1px solid var(--border)" : "none",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: alert.type === "critical" ? "var(--danger)" : "var(--warning)",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {alert.message}
                  </span>
                </div>
                <span style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  color: alert.type === "critical" ? "var(--danger)" : "var(--warning)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                }}>
                  {alert.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 20,
        alignItems: "start",
      }}>

        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 12,
          }}>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}>
              Trip Activity
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <input
                  style={{
                    padding: "7px 12px 7px 32px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-xs)",
                    width: 200,
                    fontFamily: "var(--font-body)",
                  }}
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "7px 12px",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-secondary)",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                }}
              >
                {tripStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button className="btn btn--primary btn--sm" onClick={() => navigate("/trips")}>
                + New Trip
              </button>
            </div>
          </div>

          <div className="data-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Cargo (kg)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-dim)", fontSize: "var(--text-sm)" }}>
                      No trips found
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip, i) => {
                    const pill = statusPillMap[trip.status] || statusPillMap["Draft"];
                    return (
                      <tr key={trip.id} style={{ cursor: "pointer" }} onClick={() => navigate("/trips")}>
                        <td style={{ color: "var(--text-dim)", fontWeight: 500 }}>{i + 1}</td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {vehicleMap[trip.vehicleId] || trip.vehicleId}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {driverMap[trip.driverId] || trip.driverId}
                        </td>
                        <td>
                          <span style={{ color: "var(--text-secondary)" }}>{trip.origin}</span>
                          <span style={{ color: "var(--text-dim)", margin: "0 6px" }}>→</span>
                          <span style={{ color: "var(--text-secondary)" }}>{trip.destination}</span>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                          {trip.cargoWeight?.toLocaleString()}
                        </td>
                        <td><span className={pill.cls}>{pill.label}</span></td>
                        <td style={{ color: "var(--text-dim)", fontSize: "var(--text-xs)" }}>{trip.date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}>
              Fleet Status
            </div>
            <div style={{ padding: "8px 0" }}>
              {state.vehicles.map((v) => {
                const pill = vehicleStatusMap[v.status] || vehicleStatusMap["Idle"];
                return (
                  <div
                    key={v.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 18px",
                      borderBottom: "1px solid var(--border)",
                      gap: 8,
                      cursor: "pointer",
                      transition: "background 150ms ease",
                    }}
                    onClick={() => navigate("/vehicles")}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-primary)" }}>
                        {v.model}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                        {v.plate}
                      </div>
                    </div>
                    <span className={pill.cls}>{pill.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
              <button
                className="btn btn--ghost btn--sm"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => navigate("/vehicles")}
              >
                Manage Vehicles →
              </button>
            </div>
          </div>

          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px",
          }}>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}>
              Quick Navigation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Trip Dispatcher",     path: "/trips",       color: "var(--info)"    },
                { label: "Maintenance Logs",    path: "/maintenance", color: "var(--warning)" },
                { label: "Driver Profiles",     path: "/drivers",     color: "var(--primary)" },
                { label: "Analytics & Reports", path: "/analytics",   color: "var(--primary)" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "border-color 150ms ease",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-xs)",
                    color: "var(--text-secondary)",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.color = item.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {item.label}
                  <span style={{ fontSize: 14 }}>→</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
