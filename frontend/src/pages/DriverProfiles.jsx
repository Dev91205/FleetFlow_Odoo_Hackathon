import { useState } from "react";
import { useFleet } from "../context/FleetContext";

// ── ICONS ─────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const UserIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ── HELPERS ───────────────────────────────────────────────────
const getDaysUntilExpiry = (dateStr) => {
  const expiry = new Date(dateStr);
  const today  = new Date();
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

// Color a value on a green/amber/red scale
const scoreColor = (score) => {
  if (score >= 90) return "var(--primary)";
  if (score >= 70) return "var(--warning)";
  return "var(--danger)";
};

const progressFillClass = (score) => {
  if (score >= 90) return "";
  if (score >= 70) return "progress-fill--warning";
  return "progress-fill--danger";
};

// ── STATUS PILL ───────────────────────────────────────────────
const DriverStatusPill = ({ status }) => {
  const map = {
    "On Duty":  "pill--on-duty",
    "Off Duty": "pill--off-duty",
    "Suspended":"pill--suspended",
  };
  return <span className={`pill ${map[status] || "pill--idle"}`}>{status}</span>;
};

// ── LICENSE EXPIRY CELL ───────────────────────────────────────
const ExpiryCell = ({ dateStr }) => {
  const days = getDaysUntilExpiry(dateStr);
  let color = "var(--text-secondary)";
  let label = dateStr;
  let tag   = null;

  if (days < 0) {
    color = "var(--danger)";
    tag   = <span style={{ marginLeft: 6, fontSize: "var(--text-xs)", background: "var(--danger-dim)", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: "var(--radius-sm)", padding: "1px 6px", fontWeight: 700, letterSpacing: "0.06em" }}>EXPIRED</span>;
  } else if (days <= 30) {
    color = "var(--warning)";
    tag   = <span style={{ marginLeft: 6, fontSize: "var(--text-xs)", background: "var(--warning-dim)", border: "1px solid var(--warning)", color: "var(--warning)", borderRadius: "var(--radius-sm)", padding: "1px 6px", fontWeight: 700, letterSpacing: "0.06em" }}>{days}d</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color }}>{label}</span>
      {tag}
    </div>
  );
};

// ── PROGRESS BAR CELL ─────────────────────────────────────────
const ProgressCell = ({ value, suffix = "%" }) => (
  <div>
    <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: scoreColor(value), fontWeight: 500 }}>
      {value}{suffix}
    </div>
    <div className="progress-bar" style={{ width: 80, marginTop: 4 }}>
      <div
        className={`progress-fill ${progressFillClass(value)}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

// ── ADD DRIVER MODAL ──────────────────────────────────────────
const emptyForm = {
  name:          "",
  license:       "",
  licenseExpiry: "",
  type:          "Light",
};

const AddDriverModal = ({ onClose, onSave }) => {
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name          = "Enter driver name";
    if (!form.license.trim())       e.license       = "Enter license number";
    if (!form.licenseExpiry)        e.licenseExpiry = "Enter license expiry date";
    else {
      const days = getDaysUntilExpiry(form.licenseExpiry);
      if (days <= 0) e.licenseExpiry = "License is already expired — driver cannot be added as On Duty";
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      name:          form.name.trim(),
      license:       form.license.trim(),
      licenseExpiry: form.licenseExpiry,
      type:          form.type,
    });
    onClose();
  };

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(ev) => ev.stopPropagation()}>
        <div className="modal-title">Add Driver Profile</div>

        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className={`form-input${errors.name ? " form-input--error" : ""}`}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">License Number</label>
            <input
              className={`form-input${errors.license ? " form-input--error" : ""}`}
              placeholder="e.g. MH-1234-56789"
              value={form.license}
              onChange={(e) => set("license", e.target.value)}
            />
            {errors.license && <span className="form-error-msg">{errors.license}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">License Expiry</label>
              <input
                className={`form-input${errors.licenseExpiry ? " form-input--error" : ""}`}
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => set("licenseExpiry", e.target.value)}
              />
              {errors.licenseExpiry && <span className="form-error-msg">{errors.licenseExpiry}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">License Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="Light">Light</option>
                <option value="Heavy">Heavy</option>
              </select>
            </div>
          </div>

          {/* Info note about initial values */}
          <div style={{
            padding: "10px 14px",
            background: "var(--primary-dim)",
            border: "1px solid var(--primary)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}>
            New drivers start with <strong style={{ color: "var(--primary)" }}>Safety Score: 100</strong> · <strong style={{ color: "var(--primary)" }}>Completion Rate: 0%</strong> · Status: <strong style={{ color: "var(--primary)" }}>On Duty</strong>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
              Add Driver
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

// ── STATUS CHANGE MODAL ───────────────────────────────────────
const StatusModal = ({ driver, onClose, onSave }) => {
  const [selected, setSelected] = useState(driver.status);

  const options = ["On Duty", "Off Duty", "Suspended"];
  const colorMap = {
    "On Duty":   "var(--primary)",
    "Off Duty":  "var(--text-secondary)",
    "Suspended": "var(--danger)",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
        <div className="modal-title">Update Driver Status</div>
        <div className="modal-body">

          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
            Changing status for <strong style={{ color: "var(--text-primary)" }}>{driver.name}</strong>. Suspended or Off Duty drivers are blocked from trip assignment.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected(opt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: selected === opt ? "var(--bg-elevated)" : "transparent",
                  border: `1px solid ${selected === opt ? colorMap[opt] : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  color: selected === opt ? colorMap[opt] : "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  fontWeight: selected === opt ? 600 : 400,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {opt}
                {selected === opt && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="btn btn--primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => { onSave(driver.id, selected); onClose(); }}
            >
              Save Status
            </button>
            <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────
const DriverProfiles = () => {
  const { state, dispatch, getDaysUntilExpiry: ctxExpiry } = useFleet();

  const [showAddModal, setShowAddModal]     = useState(false);
  const [statusModal, setStatusModal]       = useState(null); // driver object
  const [search, setSearch]                 = useState("");
  const [filterStatus, setFilterStatus]     = useState("All");
  const [filterType, setFilterType]         = useState("All");

  const statuses  = ["All", "On Duty", "Off Duty", "Suspended"];
  const types     = ["All", "Light", "Heavy"];

  // ── KPI counts ────────────────────────────────────────────
  const onDutyCount    = state.drivers.filter((d) => d.status === "On Duty").length;
  const offDutyCount   = state.drivers.filter((d) => d.status === "Off Duty").length;
  const suspendedCount = state.drivers.filter((d) => d.status === "Suspended").length;
  const expiredCount   = state.drivers.filter((d) => getDaysUntilExpiry(d.licenseExpiry) <= 0).length;

  const summaryStats = [
    { label: "Total Drivers",    value: state.drivers.length, color: "var(--text-primary)"  },
    { label: "On Duty",          value: onDutyCount,          color: "var(--primary)"        },
    { label: "Off Duty",         value: offDutyCount,         color: "var(--text-secondary)" },
    { label: "Suspended / Expired", value: suspendedCount + expiredCount, color: "var(--danger)" },
  ];

  // ── Filtering ─────────────────────────────────────────────
  const filtered = state.drivers.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || d.status === filterStatus;
    const matchType   = filterType   === "All" || d.type   === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const handleAddDriver = (data) => {
    dispatch({ type: "ADD_DRIVER", payload: data });
  };

  const handleStatusSave = (driverId, newStatus) => {
    dispatch({ type: "SET_DRIVER_STATUS", payload: { id: driverId, status: newStatus } });
  };

  // Is this driver currently on an active trip?
  const isOnActiveTrip = (driverId) =>
    state.trips.some(
      (t) => t.driverId === driverId && (t.status === "On Trip" || t.status === "Dispatched")
    );

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Profiles</h1>
          <p className="page-subtitle">License validity, safety scores, and duty status for all drivers</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <PlusIcon />
          Add Driver
        </button>
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

      {/* ── Safety Info Banner ───────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--info)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 20px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ color: "var(--info)", flexShrink: 0 }}><ShieldIcon /></span>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Drivers with <strong style={{ color: "var(--danger)" }}>expired licenses</strong> or <strong style={{ color: "var(--danger)" }}>Suspended</strong> status are automatically blocked from trip assignment in the Dispatcher.
          Licenses expiring within <strong style={{ color: "var(--warning)" }}>30 days</strong> are flagged in the Alert Center.
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="toolbar">
        <div className="toolbar-search">
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by name or license number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="toolbar-btn"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>
        <select
          className="toolbar-btn"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          {types.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All Types" : `${t} License`}</option>
          ))}
        </select>
      </div>

      {/* ── Data Table ───────────────────────────────────────── */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License #</th>
              <th>Type</th>
              <th>Expiry</th>
              <th>Completion Rate</th>
              <th>Safety Score</th>
              <th>Complaints</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div style={{ opacity: 0.3, marginBottom: 12 }}><UserIcon /></div>
                    <div>No drivers found. Add your first driver profile above.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((driver) => {
                const days       = getDaysUntilExpiry(driver.licenseExpiry);
                const expired    = days <= 0;
                const onTrip     = isOnActiveTrip(driver.id);
                const dimmed     = expired || driver.status === "Suspended";

                return (
                  <tr
                    key={driver.id}
                    style={{ opacity: dimmed ? 0.55 : 1, transition: "opacity 150ms ease" }}
                  >

                    {/* Driver name + avatar */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: dimmed ? "var(--bg-elevated)" : "var(--primary-dim)",
                          border: `1px solid ${dimmed ? "var(--border)" : "var(--primary)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: dimmed ? "var(--text-dim)" : "var(--primary)",
                          flexShrink: 0,
                          fontFamily: "var(--font-heading)",
                        }}>
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
                            {driver.name}
                          </div>
                          {onTrip && (
                            <div style={{ fontSize: 10, color: "var(--info)", marginTop: 2, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              ● On Active Trip
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* License number */}
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
                        {driver.license}
                      </span>
                    </td>

                    {/* License type */}
                    <td style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {driver.type}
                    </td>

                    {/* Expiry with color + tag */}
                    <td>
                      <ExpiryCell dateStr={driver.licenseExpiry} />
                    </td>

                    {/* Completion rate with progress bar */}
                    <td>
                      <ProgressCell value={driver.completionRate} />
                    </td>

                    {/* Safety score with color band */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: scoreColor(driver.safetyScore), flexShrink: 0 }}>
                          <ShieldIcon />
                        </span>
                        <ProgressCell value={driver.safetyScore} />
                      </div>
                    </td>

                    {/* Complaints */}
                    <td>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-sm)",
                        color: driver.complaints >= 10
                          ? "var(--danger)"
                          : driver.complaints >= 5
                          ? "var(--warning)"
                          : "var(--text-secondary)",
                        fontWeight: driver.complaints >= 5 ? 600 : 400,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}>
                        {driver.complaints >= 5 && <AlertIcon />}
                        {driver.complaints}
                      </span>
                    </td>

                    {/* Status pill */}
                    <td>
                      <DriverStatusPill status={driver.status} />
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {/* Status toggle button — disabled if driver is on an active trip */}
                        <button
                          className="btn btn--sm btn--ghost"
                          style={{ fontSize: 11, padding: "5px 12px" }}
                          onClick={() => setStatusModal(driver)}
                          disabled={onTrip}
                          title={onTrip ? "Cannot change status while driver is on an active trip" : "Change driver status"}
                        >
                          Set Status
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer count ─────────────────────────────────────── */}
      <div style={{ marginTop: 12, fontSize: "var(--text-xs)", color: "var(--text-dim)", textAlign: "right" }}>
        Showing {filtered.length} of {state.drivers.length} drivers
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        padding: "14px 20px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        gap: 28,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Score Guide</span>
        {[
          { label: "90–100 Excellent", color: "var(--primary)"  },
          { label: "70–89 Good",       color: "var(--warning)"  },
          { label: "< 70 At Risk",     color: "var(--danger)"   },
        ].map((g) => (
          <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{g.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
          Dimmed rows = expired license or suspended — blocked from dispatch
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      {showAddModal && (
        <AddDriverModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddDriver}
        />
      )}

      {statusModal && (
        <StatusModal
          driver={statusModal}
          onClose={() => setStatusModal(null)}
          onSave={handleStatusSave}
        />
      )}
    </div>
  );
};

export default DriverProfiles;
