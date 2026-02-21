import { useState } from "react";
import { useFleet } from "../context/FleetContext";

const vehicleTypes = ["Mini Truck", "Trailer Truck", "Van", "Bike", "Container"];

const StatusPill = ({ status }) => {
  const map = {
    "Available": "pill--available",
    "On Trip":   "pill--on-trip",
    "In Shop":   "pill--in-shop",
    "Idle":      "pill--idle",
  };
  return <span className={`pill ${map[status] || "pill--idle"}`}>{status}</span>;
};

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const emptyForm = {
  model: "",
  plate: "",
  type: "Mini Truck",
  capacity: "",
  odometer: "",
  acquisitionCost: "",
};

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const [form, setForm] = useState(
    vehicle
      ? { model: vehicle.model, plate: vehicle.plate, type: vehicle.type, capacity: vehicle.capacity, odometer: vehicle.odometer, acquisitionCost: vehicle.acquisitionCost }
      : emptyForm
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.model.trim())        e.model        = "Model name is required";
    if (!form.plate.trim())        e.plate        = "License plate is required";
    if (!form.capacity)            e.capacity     = "Max capacity is required";
    if (isNaN(form.capacity))      e.capacity     = "Must be a number";
    if (!form.odometer)            e.odometer     = "Odometer reading is required";
    if (isNaN(form.odometer))      e.odometer     = "Must be a number";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    onSave({
      ...form,
      capacity:        Number(form.capacity),
      odometer:        Number(form.odometer),
      acquisitionCost: Number(form.acquisitionCost) || 0,
      ...(vehicle ? { id: vehicle.id, status: vehicle.status } : {}),
    });
    onClose();
  };

  const field = (label, key, placeholder, type = "text") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className={`form-input${errors[key] ? " form-input--error" : ""}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
      />
      {errors[key] && <span className="form-error-msg">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          {vehicle ? "Edit Vehicle" : "New Vehicle Registration"}
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {field("Name / Model", "model", "e.g. TATA 407, Eicher Pro")}
          {field("License Plate", "plate", "e.g. MH-04-AB-1234")}

          <div className="form-group">
            <label className="form-label">Vehicle Type</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {field("Max Payload Capacity (kg)", "capacity", "e.g. 5000", "number")}
          {field("Initial Odometer (km)", "odometer", "e.g. 79000", "number")}
          {field("Acquisition Cost (₹)", "acquisitionCost", "e.g. 850000", "number")}

          <div className="modal-actions">
            <button type="submit" className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
              {vehicle ? "Save Changes" : "Register Vehicle"}
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

const VehicleRegistry = () => {
  const { state, dispatch } = useFleet();
  const [search, setSearch]       = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const types    = ["All", ...vehicleTypes];
  const statuses = ["All", "Available", "On Trip", "In Shop", "Idle"];

  const filtered = state.vehicles.filter((v) => {
    const matchSearch = v.model.toLowerCase().includes(search.toLowerCase()) ||
                        v.plate.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === "All"   || v.type   === filterType;
    const matchStatus = filterStatus === "All" || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleSave = (data) => {
    if (data.id) {
      dispatch({ type: "UPDATE_VEHICLE", payload: data });
    } else {
      dispatch({ type: "ADD_VEHICLE", payload: data });
    }
  };

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_VEHICLE", payload: id });
    setDeleteConfirm(null);
  };

  const handleStatusToggle = (vehicle) => {
    const next = vehicle.status === "Idle" ? "Available" : "Idle";
    dispatch({ type: "SET_VEHICLE_STATUS", payload: { id: vehicle.id, status: next } });
  };

  const summaryStats = [
    { label: "Total Vehicles",  value: state.vehicles.length,                                    color: "var(--text-primary)" },
    { label: "Available",       value: state.vehicles.filter(v => v.status === "Available").length, color: "var(--primary)"    },
    { label: "On Trip",         value: state.vehicles.filter(v => v.status === "On Trip").length,   color: "var(--info)"       },
    { label: "In Shop",         value: state.vehicles.filter(v => v.status === "In Shop").length,   color: "var(--warning)"    },
  ];

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-subtitle">Manage your entire fleet — add, edit, and track every asset</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => { setEditVehicle(null); setShowModal(true); }}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <PlusIcon /> New Vehicle
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

      <div className="toolbar">
        <div className="toolbar-search">
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by model or plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="toolbar-btn"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          {types.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>

        <select
          className="toolbar-btn"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
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
              <th>Model</th>
              <th>License Plate</th>
              <th>Type</th>
              <th>Capacity (kg)</th>
              <th>Odometer (km)</th>
              <th>Acq. Cost (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🚛</div>
                    <div>No vehicles found. Add your first vehicle to get started.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((v, i) => (
                <tr key={v.id}>
                  <td style={{ color: "var(--text-dim)", fontSize: "var(--text-xs)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                      {v.model}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-xs)",
                      padding: "3px 10px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      letterSpacing: "0.06em",
                    }}>
                      {v.plate}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{v.type}</td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)" }}>
                    {v.capacity.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)" }}>
                    {v.odometer.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {v.acquisitionCost ? `₹${(v.acquisitionCost / 100000).toFixed(1)}L` : "—"}
                  </td>
                  <td>
                    <StatusPill status={v.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      {(v.status === "Available" || v.status === "Idle") && (
                        <button
                          onClick={() => handleStatusToggle(v)}
                          className="btn btn--ghost btn--sm"
                          data-tooltip={v.status === "Idle" ? "Mark Available" : "Mark Idle"}
                          style={{ fontSize: 11, padding: "4px 10px" }}
                        >
                          {v.status === "Idle" ? "Activate" : "Idle"}
                        </button>
                      )}
                      <button
                        onClick={() => { setEditVehicle(v); setShowModal(true); }}
                        className="btn btn--ghost btn--sm"
                        style={{ padding: "6px 8px" }}
                        data-tooltip="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(v.id)}
                        className="btn btn--sm"
                        style={{
                          padding: "6px 8px",
                          background: "var(--danger-dim)",
                          border: "1px solid var(--danger)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--danger)",
                        }}
                        data-tooltip="Delete"
                        disabled={v.status === "On Trip"}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 12,
        fontSize: "var(--text-xs)",
        color: "var(--text-dim)",
        textAlign: "right",
      }}>
        Showing {filtered.length} of {state.vehicles.length} vehicles
      </div>

      {showModal && (
        <VehicleModal
          vehicle={editVehicle}
          onClose={() => { setShowModal(false); setEditVehicle(null); }}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 380 }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <div className="modal-title" style={{ marginBottom: 0 }}>Confirm Delete</div>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
              >
                <CloseIcon />
              </button>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to remove this vehicle from the registry? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn--danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;
