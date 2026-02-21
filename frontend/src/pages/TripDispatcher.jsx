import { useState } from "react";
import { useFleet, selectAvailableVehicles, selectAvailableDrivers, suggestOptimalVehicle } from "../context/FleetContext";

const StatusPill = ({ status }) => {
  const map = {
    "Dispatched": "pill--on-trip",
    "On Trip":    "pill--on-trip",
    "Completed":  "pill--done",
    "Cancelled":  "pill--suspended",
    "Draft":      "pill--idle",
  };
  return <span className={`pill ${map[status] || "pill--idle"}`}>{status}</span>;
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const emptyForm = {
  vehicleId:    "",
  driverId:     "",
  cargoWeight:  "",
  origin:       "",
  destination:  "",
  fuelCost:     "",
  fleetType:    "",
};

const TripDispatcher = () => {
  const { state, dispatch } = useFleet();
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [errors, setErrors]         = useState({});
  const [completeModal, setCompleteModal] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState("");

  const availableVehicles = selectAvailableVehicles(state);
  const availableDrivers  = selectAvailableDrivers(state);
  const suggestions       = form.cargoWeight && Number(form.cargoWeight) > 0
    ? suggestOptimalVehicle(Number(form.cargoWeight), state.vehicles, state.expenses)
    : [];

  const cargoTooHeavy = form.vehicleId && form.cargoWeight
    ? (() => {
        const v = state.vehicles.find(v => v.id === form.vehicleId);
        return v && Number(form.cargoWeight) > v.capacity;
      })()
    : false;

  const statuses = ["All", "Dispatched", "On Trip", "Completed", "Cancelled", "Draft"];

  const filtered = state.trips.filter((t) => {
    const v = state.vehicles.find(v => v.id === t.vehicleId);
    const d = state.drivers.find(d => d.id === t.driverId);
    const matchSearch = (v?.model || "").toLowerCase().includes(search.toLowerCase()) ||
                        (d?.name  || "").toLowerCase().includes(search.toLowerCase()) ||
                        (t.origin || "").toLowerCase().includes(search.toLowerCase()) ||
                        (t.destination || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const validate = () => {
    const e = {};
    if (!form.vehicleId)   e.vehicleId   = "Select a vehicle";
    if (!form.driverId)    e.driverId    = "Select a driver";
    if (!form.cargoWeight) e.cargoWeight = "Enter cargo weight";
    if (isNaN(form.cargoWeight)) e.cargoWeight = "Must be a number";
    if (!form.origin)      e.origin      = "Enter origin";
    if (!form.destination) e.destination = "Enter destination";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const vehicle = state.vehicles.find(v => v.id === form.vehicleId);

    dispatch({
      type: "CREATE_TRIP",
      payload: {
        ...form,
        cargoWeight: Number(form.cargoWeight),
        fuelCost:    Number(form.fuelCost) || 0,
        fleetType:   vehicle?.type || "",
      },
    });

    if (!state._error) {
      setForm(emptyForm);
      setErrors({});
      setShowForm(false);
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    setForm({ ...form, vehicleId, fleetType: vehicle?.type || "" });
    setErrors({ ...errors, vehicleId: "" });
  };

  const handleComplete = () => {
    dispatch({
      type: "COMPLETE_TRIP",
      payload: { tripId: completeModal, finalOdometer: Number(finalOdometer) || undefined },
    });
    setCompleteModal(null);
    setFinalOdometer("");
  };

  const handleCancel = (tripId) => {
    dispatch({ type: "CANCEL_TRIP", payload: tripId });
  };

  const summaryStats = [
    { label: "Total Trips",     value: state.trips.length,                                       color: "var(--text-primary)" },
    { label: "Active",          value: state.trips.filter(t => t.status === "Dispatched" || t.status === "On Trip").length, color: "var(--info)" },
    { label: "Completed",       value: state.trips.filter(t => t.status === "Completed").length, color: "var(--primary)"      },
    { label: "Pending Draft",   value: state.trips.filter(t => t.status === "Draft").length,     color: "var(--warning)"      },
  ];

  const scoreColor = (score) =>
    score >= 85 ? "var(--primary)" : score >= 65 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Create and manage trips — cargo validation enforced automatically</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowForm(!showForm)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <PlusIcon /> {showForm ? "Close Form" : "New Trip"}
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

      {showForm && (
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderTop: "2px solid var(--primary)",
          borderRadius: "var(--radius-lg)",
          padding: 32,
          marginBottom: 32,
          animation: "slideUp 250ms ease both",
        }}>
          <div style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ width: 3, height: 20, background: "var(--primary)", borderRadius: 99, display: "block" }} />
            New Trip Form
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select
                  className={`form-select${errors.vehicleId ? " form-input--error" : ""}`}
                  value={form.vehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                >
                  <option value="">— Choose available vehicle —</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} · {v.plate} · {v.capacity.toLocaleString()}kg
                    </option>
                  ))}
                </select>
                {errors.vehicleId && <span className="form-error-msg">{errors.vehicleId}</span>}
                {availableVehicles.length === 0 && (
                  <span className="form-error-msg">No vehicles available right now</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Select Driver</label>
                <select
                  className={`form-select${errors.driverId ? " form-input--error" : ""}`}
                  value={form.driverId}
                  onChange={(e) => { setForm({ ...form, driverId: e.target.value }); setErrors({ ...errors, driverId: "" }); }}
                >
                  <option value="">— Choose available driver —</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.license} · Safety {d.safetyScore}%
                    </option>
                  ))}
                </select>
                {errors.driverId && <span className="form-error-msg">{errors.driverId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Cargo Weight (kg)</label>
                <input
                  className={`form-input${errors.cargoWeight || cargoTooHeavy ? " form-input--error" : ""}`}
                  type="number"
                  placeholder="e.g. 4500"
                  value={form.cargoWeight}
                  onChange={(e) => { setForm({ ...form, cargoWeight: e.target.value }); setErrors({ ...errors, cargoWeight: "" }); }}
                />
                {errors.cargoWeight && <span className="form-error-msg">{errors.cargoWeight}</span>}
                {cargoTooHeavy && (
                  <span className="form-error-msg">
                    ⚠ Exceeds vehicle capacity ({state.vehicles.find(v => v.id === form.vehicleId)?.capacity?.toLocaleString()}kg max)
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Fuel Cost (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 3500"
                  value={form.fuelCost}
                  onChange={(e) => setForm({ ...form, fuelCost: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Origin Address</label>
                <input
                  className={`form-input${errors.origin ? " form-input--error" : ""}`}
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={form.origin}
                  onChange={(e) => { setForm({ ...form, origin: e.target.value }); setErrors({ ...errors, origin: "" }); }}
                />
                {errors.origin && <span className="form-error-msg">{errors.origin}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Destination</label>
                <input
                  className={`form-input${errors.destination ? " form-input--error" : ""}`}
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={form.destination}
                  onChange={(e) => { setForm({ ...form, destination: e.target.value }); setErrors({ ...errors, destination: "" }); }}
                />
                {errors.destination && <span className="form-error-msg">{errors.destination}</span>}
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="optimizer-card" style={{ marginBottom: 24 }}>
                <div className="optimizer-title">
                  <span>⚡</span> Smart Load Optimizer — Suggested Vehicles for {Number(form.cargoWeight).toLocaleString()}kg
                </div>
                <div>
                  {suggestions.slice(0, 3).map((s, i) => (
                    <div
                      key={s.id}
                      className="optimizer-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleVehicleSelect(s.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--radius-sm)",
                          background: i === 0 ? "var(--primary-dim)" : "var(--bg-base)",
                          border: `1px solid ${i === 0 ? "var(--primary)" : "var(--border)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: i === 0 ? "var(--primary)" : "var(--text-dim)",
                        }}>
                          <TruckIcon />
                        </div>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                            {s.model}
                            {form.vehicleId === s.id && (
                              <span style={{ marginLeft: 8, color: "var(--primary)" }}><CheckIcon /></span>
                            )}
                          </div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                            {s.plate} · {s.capacity.toLocaleString()}kg cap · {s.capacityFit}% load utilization · {s.odometer.toLocaleString()}km
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                        <div style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-xl)",
                          color: scoreColor(s.score),
                          lineHeight: 1,
                        }}>
                          {s.score}
                        </div>
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: scoreColor(s.score),
                        }}>
                          {s.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginTop: 10 }}>
                  Scored by capacity fit (55%) + odometer freshness (45%). Click a row to select.
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={cargoTooHeavy}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                Confirm & Dispatch Trip →
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { setShowForm(false); setForm(emptyForm); setErrors({}); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-search">
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by vehicle, driver, origin or destination..."
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
              <th>#</th>
              <th>Fleet Type</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Origin → Destination</th>
              <th>Cargo (kg)</th>
              <th>Fuel Est.</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🗺️</div>
                    <div>No trips found. Dispatch your first trip to get started.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => {
                const vehicle = state.vehicles.find(v => v.id === t.vehicleId);
                const driver  = state.drivers.find(d => d.id === t.driverId);
                return (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text-dim)", fontSize: "var(--text-xs)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                      {t.fleetType || vehicle?.type || "—"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
                        {vehicle?.model || t.vehicleId}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                        {vehicle?.plate || ""}
                      </div>
                    </td>
                    <td style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      {driver?.name || t.driverId}
                    </td>
                    <td>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                        {t.origin}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                        → {t.destination}
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)" }}>
                      {t.cargoWeight?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      {t.fuelCost ? `₹${t.fuelCost.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
                      {t.date}
                    </td>
                    <td>
                      <StatusPill status={t.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {(t.status === "Dispatched" || t.status === "On Trip") && (
                          <>
                            <button
                              className="btn btn--sm"
                              style={{
                                background: "var(--primary-dim)",
                                border: "1px solid var(--primary)",
                                color: "var(--primary)",
                                borderRadius: "var(--radius-md)",
                                padding: "5px 10px",
                                fontSize: 11,
                              }}
                              onClick={() => setCompleteModal(t.id)}
                            >
                              Complete
                            </button>
                            <button
                              className="btn btn--sm"
                              style={{
                                background: "var(--danger-dim)",
                                border: "1px solid var(--danger)",
                                color: "var(--danger)",
                                borderRadius: "var(--radius-md)",
                                padding: "5px 10px",
                                fontSize: 11,
                              }}
                              onClick={() => handleCancel(t.id)}
                            >
                              Cancel
                            </button>
                          </>
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
        Showing {filtered.length} of {state.trips.length} trips
      </div>

      {completeModal && (
        <div className="modal-overlay" onClick={() => setCompleteModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-title" style={{ marginBottom: 20 }}>Mark Trip as Completed</div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
              Enter the final odometer reading to update the vehicle's mileage record.
            </p>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Final Odometer (km)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 82500"
                value={finalOdometer}
                onChange={(e) => setFinalOdometer(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleComplete}>
                Confirm Complete
              </button>
              <button className="btn btn--ghost" onClick={() => setCompleteModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDispatcher;
