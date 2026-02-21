import { useState } from "react";
import { useFleet } from "../context/FleetContext";

// ── ICONS ─────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ReceiptIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

// ── STATUS PILL ───────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    "Done":    "pill--done",
    "Pending": "pill--in-shop",
    "Draft":   "pill--idle",
  };
  return <span className={`pill ${map[status] || "pill--idle"}`}>{status}</span>;
};

// ── ADD EXPENSE MODAL ─────────────────────────────────────────
const emptyForm = {
  tripId:      "",
  driver:      "",
  distance:    "",
  fuelExpense: "",
  miscExpense: "",
};

const AddExpenseModal = ({ onClose, onSave, trips, drivers }) => {
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // When trip is selected, auto-fill driver from trip data
  const handleTripChange = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      const driver = drivers.find((d) => d.id === trip.driverId);
      setForm((prev) => ({
        ...prev,
        tripId,
        driver:      driver?.name || "",
        fuelExpense: trip.fuelCost ? String(trip.fuelCost) : prev.fuelExpense,
      }));
    } else {
      setForm((prev) => ({ ...prev, tripId }));
    }
    setErrors((prev) => ({ ...prev, tripId: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.tripId)          e.tripId      = "Select a trip";
    if (!form.driver.trim())   e.driver      = "Enter driver name";
    if (!form.distance)        e.distance    = "Enter distance";
    if (isNaN(form.distance) || Number(form.distance) <= 0)
                               e.distance    = "Enter a valid distance in km";
    if (!form.fuelExpense)     e.fuelExpense = "Enter fuel expense";
    if (isNaN(form.fuelExpense) || Number(form.fuelExpense) < 0)
                               e.fuelExpense = "Must be a valid number";
    if (form.miscExpense && isNaN(form.miscExpense))
                               e.miscExpense = "Must be a valid number";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    onSave({
      tripId:      form.tripId,
      driver:      form.driver.trim(),
      distance:    Number(form.distance),
      fuelExpense: Number(form.fuelExpense),
      miscExpense: Number(form.miscExpense) || 0,
    });
    onClose();
  };

  // Only completed or on-trip trips that don't already have an expense
  const eligibleTrips = trips.filter(
    (t) => t.status === "Completed" || t.status === "On Trip"
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Add Trip Expense</div>

        <form onSubmit={handleSubmit} className="modal-body">

          {/* Trip ID */}
          <div className="form-group">
            <label className="form-label">Trip ID</label>
            <select
              className={`form-select${errors.tripId ? " form-input--error" : ""}`}
              value={form.tripId}
              onChange={(e) => handleTripChange(e.target.value)}
            >
              <option value="">— Select trip —</option>
              {eligibleTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.origin} → {t.destination} · {t.status}
                </option>
              ))}
            </select>
            {errors.tripId && <span className="form-error-msg">{errors.tripId}</span>}
          </div>

          {/* Driver */}
          <div className="form-group">
            <label className="form-label">Driver</label>
            <input
              className={`form-input${errors.driver ? " form-input--error" : ""}`}
              placeholder="Auto-filled from trip or enter manually"
              value={form.driver}
              onChange={(e) => { setForm({ ...form, driver: e.target.value }); setErrors({ ...errors, driver: "" }); }}
            />
            {errors.driver && <span className="form-error-msg">{errors.driver}</span>}
          </div>

          {/* Distance */}
          <div className="form-group">
            <label className="form-label">Distance (km)</label>
            <input
              className={`form-input${errors.distance ? " form-input--error" : ""}`}
              type="number"
              placeholder="e.g. 280"
              value={form.distance}
              onChange={(e) => { setForm({ ...form, distance: e.target.value }); setErrors({ ...errors, distance: "" }); }}
            />
            {errors.distance && <span className="form-error-msg">{errors.distance}</span>}
          </div>

          {/* Fuel & Misc side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Fuel Cost (₹)</label>
              <input
                className={`form-input${errors.fuelExpense ? " form-input--error" : ""}`}
                type="number"
                placeholder="e.g. 2200"
                value={form.fuelExpense}
                onChange={(e) => { setForm({ ...form, fuelExpense: e.target.value }); setErrors({ ...errors, fuelExpense: "" }); }}
              />
              {errors.fuelExpense && <span className="form-error-msg">{errors.fuelExpense}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Misc. Expense (₹)</label>
              <input
                className={`form-input${errors.miscExpense ? " form-input--error" : ""}`}
                type="number"
                placeholder="e.g. 500"
                value={form.miscExpense}
                onChange={(e) => { setForm({ ...form, miscExpense: e.target.value }); setErrors({ ...errors, miscExpense: "" }); }}
              />
              {errors.miscExpense && <span className="form-error-msg">{errors.miscExpense}</span>}
            </div>
          </div>

          {/* Live total preview */}
          {(form.fuelExpense || form.miscExpense) && (
            <div style={{
              padding: "10px 14px",
              background: "var(--primary-dim)",
              border: "1px solid var(--primary)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Total Trip Cost
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--primary)" }}>
                ₹{((Number(form.fuelExpense) || 0) + (Number(form.miscExpense) || 0)).toLocaleString()}
              </span>
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
              Add Expense
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

// ── MAIN PAGE ─────────────────────────────────────────────────
const ExpenseLogs = () => {
  const { state, dispatch } = useFleet();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("All");

  const statuses = ["All", "Done", "Pending"];

  // ── Derived totals ─────────────────────────────────────────
  const totalFuel  = state.expenses.reduce((sum, e) => sum + (e.fuelExpense  || 0), 0);
  const totalMisc  = state.expenses.reduce((sum, e) => sum + (e.miscExpense  || 0), 0);
  const totalMaint = state.maintenanceLogs.reduce((sum, m) => sum + (m.cost   || 0), 0);
  const totalOps   = totalFuel + totalMisc + totalMaint;

  const summaryStats = [
    { label: "Total Expenses",        value: state.expenses.length,              color: "var(--text-primary)"  },
    { label: "Total Fuel Cost",        value: `₹${(totalFuel / 1000).toFixed(1)}k`,  color: "var(--info)"          },
    { label: "Total Misc Cost",        value: `₹${(totalMisc / 1000).toFixed(1)}k`,  color: "var(--warning)"       },
    { label: "Total Operational Cost", value: `₹${(totalOps  / 1000).toFixed(1)}k`,  color: "var(--primary)"       },
  ];

  // ── Filtering ──────────────────────────────────────────────
  const filtered = state.expenses.filter((e) => {
    const matchSearch =
      e.tripId.toLowerCase().includes(search.toLowerCase()) ||
      e.driver.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data) => {
    dispatch({ type: "ADD_EXPENSE", payload: data });
  };

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense &amp; Fuel Log</h1>
          <p className="page-subtitle">Track per-trip fuel and miscellaneous costs across your fleet</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <PlusIcon />
          Add an Expense
        </button>
      </div>

      {/* ── KPI Summary Row ──────────────────────────────────── */}
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

      {/* ── Ops Cost Banner ──────────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--primary)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 24px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
              Operational Cost Breakdown
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
              Fuel <strong style={{ color: "var(--info)" }}>₹{totalFuel.toLocaleString()}</strong>
              &nbsp;+&nbsp;
              Misc <strong style={{ color: "var(--warning)" }}>₹{totalMisc.toLocaleString()}</strong>
              &nbsp;+&nbsp;
              Maintenance <strong style={{ color: "var(--warning)" }}>₹{totalMaint.toLocaleString()}</strong>
              &nbsp;=&nbsp;
              Total Ops
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          color: "var(--primary)",
          whiteSpace: "nowrap",
        }}>
          ₹{(totalOps / 1000).toFixed(1)}k Total Ops
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="toolbar">
        <div className="toolbar-search">
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by Trip ID or driver name..."
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
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>
      </div>

      {/* ── Data Table ───────────────────────────────────────── */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Distance</th>
              <th>Fuel Expense</th>
              <th>Misc. Expense</th>
              <th>Total Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div style={{ opacity: 0.3, marginBottom: 12 }}><ReceiptIcon /></div>
                    <div>No expense records found. Add your first trip expense above.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((expense) => {
                const trip  = state.trips.find((t) => t.id === expense.tripId);
                const total = (expense.fuelExpense || 0) + (expense.miscExpense || 0);

                return (
                  <tr key={expense.id}>

                    {/* Trip ID badge */}
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
                        {expense.tripId}
                      </span>
                    </td>

                    {/* Driver */}
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
                        {expense.driver}
                      </div>
                    </td>

                    {/* Route (from trip context) */}
                    <td>
                      {trip ? (
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--text-primary)" }}>{trip.origin}</span>
                          <span style={{ margin: "0 5px", color: "var(--text-dim)" }}>→</span>
                          <span style={{ color: "var(--text-primary)" }}>{trip.destination}</span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: "var(--text-xs)" }}>—</span>
                      )}
                    </td>

                    {/* Distance */}
                    <td>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                        {expense.distance ? `${expense.distance.toLocaleString()} km` : "—"}
                      </span>
                    </td>

                    {/* Fuel expense */}
                    <td>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--info)", fontWeight: 500 }}>
                        ₹{(expense.fuelExpense || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Misc expense */}
                    <td>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--warning)", fontWeight: 500 }}>
                        ₹{(expense.miscExpense || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Total */}
                    <td>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md)", color: "var(--primary)", fontWeight: 600 }}>
                        ₹{total.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusPill status={expense.status} />
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: totals row ───────────────────────────────── */}
      {filtered.length > 0 && (
        <div style={{
          marginTop: 12,
          padding: "14px 20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderTop: "2px solid var(--border-accent)",
          borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
            Showing {filtered.length} of {state.expenses.length} records
          </span>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Fuel Total</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--info)" }}>
                ₹{filtered.reduce((s, e) => s + (e.fuelExpense || 0), 0).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Misc Total</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--warning)" }}>
                ₹{filtered.reduce((s, e) => s + (e.miscExpense || 0), 0).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Combined</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--primary)" }}>
                ₹{filtered.reduce((s, e) => s + (e.fuelExpense || 0) + (e.miscExpense || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────── */}
      {showModal && (
        <AddExpenseModal
          trips={state.trips}
          drivers={state.drivers}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ExpenseLogs;
