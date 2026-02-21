import { useState } from "react";
import { useFleet } from "../context/FleetContext";

const StatusPill = ({ status }) => {
  const map = {
    "New":         "pill--on-trip",
    "In Progress": "pill--in-shop",
    "Done":        "pill--done",
  };
  return <span className={`pill ${map[status] || "pill--idle"}`}>{status}</span>;
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const WrenchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const emptyForm = {
  vehicleId: "",
  issue:     "",
  date:      new Date().toISOString().split("T")[0],
  cost:      "",
};

const ServiceModal = ({ onClose, onSave, vehicles }) => {
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.vehicleId)   e.vehicleId = "Select a vehicle";
    if (!form.issue.trim()) e.issue    = "Describe the issue or service";
    if (!form.date)         e.date     = "Enter service date";
    if (!form.cost)         e.cost     = "Enter estimated cost";
    if (isNaN(form.cost))   e.cost     = "Must be a number";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const vehicle = vehicles.find(v => v.id === form.vehicleId);
    onSave({
      vehicleId: form.vehicleId,
      vehicle:   vehicle?.model || form.vehicleId,
      issue:     form.issue,
      date:      form.date,
      cost:      Number(form.cost),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">New Service Log</div>

        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-group">
            <label className="form-label">Vehicle</label>
            <select
              className={`form-select${errors.vehicleId ? " form-input--error" : ""}`}
              value={form.vehicleId}
              onChange={(e) => { setForm({ ...form, vehicleId: e.target.value }); setErrors({ ...errors, vehicleId: "" }); }}
            >
              <option value="">— Select vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model} · {v.plate} · {v.status}
                </option>
              ))}
            </select>
            {errors.vehicleId && <span className="form-error-msg">{errors.vehicleId}</span>}
            {form.vehicleId && (
              <div style={{
                marginTop: 8,
                padding: "8px 12px",
                background: "var(--warning-dim)",
                border: "1px solid var(--warning)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-xs)",
                color: "var(--warning)",
                fontWeight: 500,
              }}>
                ⚠ This vehicle will be automatically set to <strong>In Shop</strong> and removed from the dispatcher pool.
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Issue / Service Description</label>
            <textarea
              className={`form-textarea${errors.issue ? " form-input--error" : ""}`}
              placeholder="e.g. Engine overheating, Oil change, Brake pad replacement..."
              rows={3}
              value={form.issue}
              onChange={(e) => { setForm({ ...form, issue: e.target.value }); setErrors({ ...errors, issue: "" }); }}
              style={{ resize: "vertical" }}
            />
            {errors.issue && <span className="form-error-msg">{errors.issue}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Service Date</label>
              <input
                className={`form-input${errors.date ? " form-input--error" : ""}`}
                type="date"
                value={form.date}
                onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: "" }); }}
              />
              {errors.date && <span className="form-error-msg">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Cost (₹)</label>
              <input
                className={`form-input${errors.cost ? " form-input--error" : ""}`}
                type="number"
                placeholder="e.g. 12000"
                value={form.cost}
                onChange={(e) => { setForm({ ...form, cost: e.target.value }); setErrors({ ...errors, cost: "" }); }}
              />
              {errors.cost && <span className="form-error-msg">{errors.cost}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
              Create Service Log
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaintenanceLogs = () => {
  const { state, dispatch } = useFleet();
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("All");

  const statuses = ["All", "New", "In Progress", "Done"];

  const filtered = state.maintenanceLogs.filter((l) => {
    const matchSearch = l.vehicle.toLowerCase().includes(search.toLowerCase()) ||
                        l.issue.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalCost = state.maintenanceLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const activeLogs = state.maintenanceLogs.filter(l => l.status === "New" || l.status === "In Progress").length;
  const resolvedLogs = state.maintenanceLogs.filter(l => l.status === "Done").length;
  const vehiclesInShop = state.vehicles.filter(v => v.status === "In Shop").length;

  const handleSave = (data) => {
    dispatch({ type: "ADD_SERVICE_LOG", payload: data });
  };

  const handleResolve = (log) => {
    dispatch({
      type: "RESOLVE_SERVICE_LOG",
      payload: { logId: log.id, vehicleId: log.vehicleId },
    });
  };

  const summaryStats = [
    { label: "Total Logs",      value: state.maintenanceLogs.length, color: "var(--text-primary)" },
    { label: "Vehicles In Shop",value: vehiclesInShop,                color: "var(--warning)"     },
    { label: "Active Issues",   value: activeLogs,                    color: "var(--danger)"      },
    { label: "Resolved",        value: resolvedLogs,                  color: "var(--primary)"     },
  ];

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance & Service Logs</h1>
          <p className="page-subtitle">Track vehicle health — logging an issue auto-pulls the vehicle from dispatch</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <PlusIcon /> Create New Service
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {summaryStats.map((s) => (
          <div key={s.label} style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
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

      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--warning)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 24px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
              Auto-Logic Active
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
              Adding a vehicle to a service log automatically sets its status to <strong style={{ color: "var(--warning)" }}>In Shop</strong> and hides it from the Trip Dispatcher until resolved.
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          color: "var(--warning)",
          whiteSpace: "nowrap",
        }}>
          ₹{(totalCost / 1000).toFixed(1)}k Total Cost
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by vehicle or issue description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="toolbar-btn"
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          {statuses.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Vehicle</th>
              <th>Issue / Service</th>
              <th>Date</th>
              <th>Cost (₹)</th>
              <th>Vehicle Status</th>
              <th>Log Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div style={{ opacity: 0.3, marginBottom: 12 }}><WrenchIcon /></div>
                    <div>No service logs found. All vehicles are healthy!</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((l) => {
                const vehicle = state.vehicles.find(v => v.id === l.vehicleId);
                return (
                  <tr key={l.id}>
                    <td>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-xs)",
                        padding: "3px 10px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        letterSpacing: "0.06em",
                        color: "var(--text-secondary)",
                      }}>
                        {l.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
                        {l.vehicle}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                        {vehicle?.plate || ""}
                      </div>
                    </td>
                    <td style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: 220 }}>
                      {l.issue}
                    </td>
                    <td style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
                      {l.date}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-sm)",
                        color: "var(--warning)",
                        fontWeight: 500,
                      }}>
                        ₹{l.cost?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {vehicle ? (
                        <span className={`pill ${
                          vehicle.status === "In Shop"   ? "pill--in-shop"  :
                          vehicle.status === "Available" ? "pill--available" :
                          vehicle.status === "On Trip"   ? "pill--on-trip"  : "pill--idle"
                        }`}>
                          {vehicle.status}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: "var(--text-xs)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <StatusPill status={l.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {l.status !== "Done" && (
                          <button
                            className="btn btn--sm"
                            style={{
                              background: "var(--primary-dim)",
                              border: "1px solid var(--primary)",
                              color: "var(--primary)",
                              borderRadius: "var(--radius-md)",
                              padding: "5px 12px",
                              fontSize: 11,
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                            onClick={() => handleResolve(l)}
                          >
                            <CheckIcon /> Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: "var(--text-xs)", color: "var(--text-dim)", textAlign: "right" }}>
        Showing {filtered.length} of {state.maintenanceLogs.length} logs
      </div>

      {showModal && (
        <ServiceModal
          vehicles={state.vehicles}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default MaintenanceLogs;
