import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useFleet } from "../context/FleetContext";

// ── CSV EXPORT UTIL ───────────────────────────────────────────
const exportCSV = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(",");
  const body    = rows.map((r) => Object.values(r).join(",")).join("\n");
  const blob    = new Blob([`${headers}\n${body}`], { type: "text/csv" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ── CUSTOM TOOLTIP (shared) ───────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "₹", unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-accent)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      boxShadow: "var(--shadow-md)",
    }}>
      <div style={{ color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--primary)", fontWeight: 600 }}>
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{unit}
        </div>
      ))}
    </div>
  );
};

// ── SECTION HEADER ────────────────────────────────────────────
const SectionHeader = ({ title, accent = "var(--primary)" }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  }}>
    <div style={{ width: 3, height: 18, background: accent, borderRadius: "var(--radius-pill)", flexShrink: 0 }} />
    <span style={{
      fontFamily: "var(--font-heading)",
      fontSize: "var(--text-base)",
      fontWeight: 700,
      color: "var(--text-primary)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    }}>
      {title}
    </span>
  </div>
);

// ── MAIN PAGE ─────────────────────────────────────────────────
const Analytics = () => {
  const { state, getMonthlyFinancials, getVehicleROI } = useFleet();
  const [activeMonth, setActiveMonth] = useState(null);

  // ── Computed KPIs ──────────────────────────────────────────
  const totalFuelCost  = state.expenses.reduce((s, e) => s + (e.fuelExpense  || 0), 0);
  const totalMiscCost  = state.expenses.reduce((s, e) => s + (e.miscExpense  || 0), 0);
  const totalMaintCost = state.maintenanceLogs.reduce((s, m) => s + (m.cost  || 0), 0);
  const totalOps       = totalFuelCost + totalMiscCost + totalMaintCost;

  const completedTrips = state.trips.filter((t) => t.status === "Completed");
  const utilizationRate = Math.round(
    (state.vehicles.filter((v) => v.status === "On Trip").length / Math.max(state.vehicles.length, 1)) * 100
  );

  // Estimated revenue: fuelCost × 3 proxy (same formula used in FleetContext.getVehicleROI)
  const estimatedRevenue = completedTrips.reduce((s, t) => s + (t.fuelCost || 0) * 3, 0);
  const estimatedROI = totalOps > 0
    ? (((estimatedRevenue - totalOps) / Math.max(estimatedRevenue, 1)) * 100).toFixed(1)
    : "0.0";

  const kpiStats = [
    { label: "Total Fuel Cost",    value: `₹${(totalFuelCost / 100000).toFixed(2)}L`, color: "var(--info)"    },
    { label: "Fleet ROI (Est.)",   value: `${estimatedROI > 0 ? "+" : ""}${estimatedROI}%`, color: "var(--primary)"  },
    { label: "Utilization Rate",   value: `${utilizationRate}%`,                      color: "var(--primary)"  },
    { label: "Completed Trips",    value: completedTrips.length,                      color: "var(--text-primary)" },
  ];

  // ── Fuel Efficiency Trend (line chart) ─────────────────────
  // Computes km/L per completed trip using distance from expenses and fuelExpense
  const fuelTrendData = (() => {
    const monthMap = {};
    completedTrips.forEach((trip) => {
      const expense = state.expenses.find((e) => e.tripId === trip.id);
      if (!expense || !expense.fuelExpense || !expense.distance) return;
      const month = trip.date ? trip.date.slice(0, 7) : "Unknown"; // "2026-02"
      if (!monthMap[month]) monthMap[month] = { totalKm: 0, totalFuel: 0 };
      monthMap[month].totalKm   += expense.distance;
      monthMap[month].totalFuel += expense.fuelExpense;
    });

    // Fill with synthetic monthly data if real data is sparse (hackathon demo)
    const syntheticMonths = [
      { month: "Jan", kmPerL: 8.2  },
      { month: "Feb", kmPerL: 9.1  },
      { month: "Mar", kmPerL: 7.8  },
      { month: "Apr", kmPerL: 8.6  },
      { month: "May", kmPerL: 9.4  },
      { month: "Jun", kmPerL: 8.9  },
      { month: "Jul", kmPerL: 10.1 },
      { month: "Aug", kmPerL: 9.7  },
    ];

    const realPoints = Object.entries(monthMap).map(([key, val]) => ({
      month: new Date(key + "-01").toLocaleString("default", { month: "short" }),
      kmPerL: val.totalFuel > 0 ? parseFloat((val.totalKm / val.totalFuel).toFixed(2)) : 0,
    }));

    return realPoints.length >= 3 ? realPoints : syntheticMonths;
  })();

  // ── Top 5 Costliest Vehicles (bar chart) ──────────────────
  const costliestVehicles = (() => {
    return state.vehicles
      .map((v) => {
        const maintCost = state.maintenanceLogs
          .filter((m) => m.vehicleId === v.id)
          .reduce((s, m) => s + (m.cost || 0), 0);

        const vehicleTrips = state.trips.filter((t) => t.vehicleId === v.id);
        const fuelCost = state.expenses
          .filter((e) => vehicleTrips.some((t) => t.id === e.tripId))
          .reduce((s, e) => s + (e.fuelExpense || 0) + (e.miscExpense || 0), 0);

        return {
          name:      v.model.split(" ").pop(), // short label: "Ace", "Eeco" etc.
          fullName:  v.model,
          plate:     v.plate,
          totalCost: maintCost + fuelCost,
          maintCost,
          fuelCost,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
  })();

  // ── Monthly Financial Summary ──────────────────────────────
  const monthlyFinancials = getMonthlyFinancials();

  // ── Bar chart color logic ──────────────────────────────────
  const barColor = (index) => {
    const palette = [
      "var(--warning)",
      "var(--info)",
      "var(--primary)",
      "var(--danger)",
      "var(--text-secondary)",
    ];
    return palette[index % palette.length];
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Operational Analytics</h1>
          <p className="page-subtitle">Fuel efficiency trends, vehicle cost breakdown, and financial reports</p>
        </div>
        <button
          className="btn btn--ghost"
          onClick={() => exportCSV(monthlyFinancials, "fleetflow_financial_summary.csv")}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────── */}
      <div className="grid-4 stagger">
        {kpiStats.map((s) => (
          <div key={s.label} style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderLeft: `3px solid ${s.color}`,
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            transition: "box-shadow var(--transition-normal)",
            cursor: "default",
          }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 24px ${s.color}20`}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid-2">

        {/* LEFT: Fuel Efficiency Trend (Line Chart) */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
        }}>
          <SectionHeader title="Fuel Efficiency Trend" accent="var(--primary)" />
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginBottom: 16, marginTop: -12 }}>
            km / litre (₹) over time — higher is better
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fuelTrendData} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--text-dim)", fontSize: 11, fontFamily: "var(--font-body)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-dim)", fontSize: 11, fontFamily: "var(--font-body)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<ChartTooltip prefix="" unit=" km/L" />} />
              <Line
                type="monotone"
                dataKey="kmPerL"
                name="Fuel Efficiency"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ fill: "var(--primary)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT: Top 5 Costliest Vehicles (Bar Chart) */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
        }}>
          <SectionHeader title="Top 5 Costliest Vehicles" accent="var(--warning)" />
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginBottom: 16, marginTop: -12 }}>
            Combined fuel + maintenance cost per vehicle
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costliestVehicles} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-dim)", fontSize: 11, fontFamily: "var(--font-body)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-dim)", fontSize: 11, fontFamily: "var(--font-body)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<ChartTooltip prefix="₹" unit="" />} />
              <Bar dataKey="totalCost" name="Total Cost" radius={[4, 4, 0, 0]}>
                {costliestVehicles.map((_, i) => (
                  <Cell key={i} fill={barColor(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Vehicle legend below chart */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {costliestVehicles.map((v, i) => (
              <div key={v.plate} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: barColor(i), flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    {v.fullName}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{v.plate}</span>
                </div>
                <span style={{ fontSize: "var(--text-xs)", color: barColor(i), fontWeight: 600, fontFamily: "var(--font-body)" }}>
                  ₹{v.totalCost.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cost Breakdown Strip ─────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 28px",
        display: "flex",
        gap: 0,
        flexWrap: "wrap",
      }}>
        {[
          { label: "Fuel Spend",         value: totalFuelCost,  color: "var(--info)"    },
          { label: "Misc Expenses",      value: totalMiscCost,  color: "var(--warning)" },
          { label: "Maintenance Spend",  value: totalMaintCost, color: "var(--danger)"  },
          { label: "Total Operational",  value: totalOps,       color: "var(--primary)" },
        ].map((item, i, arr) => (
          <div key={item.label} style={{
            flex: "1 1 0",
            minWidth: 160,
            padding: "0 28px",
            borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: item.color, lineHeight: 1 }}>
              ₹{(item.value / 1000).toFixed(1)}k
            </div>
          </div>
        ))}
      </div>

      {/* ── Financial Summary Table ──────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        {/* Table header bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "2px solid var(--border)",
        }}>
          <SectionHeader title="Financial Summary of Month" accent="var(--primary)" />
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => exportCSV(monthlyFinancials, "fleetflow_financial_summary.csv")}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue (Est.)</th>
              <th>Fuel Cost</th>
              <th>Maintenance</th>
              <th>Net Profit</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {monthlyFinancials.map((row) => {
              const margin = row.revenue > 0
                ? ((row.netProfit / row.revenue) * 100).toFixed(1)
                : "0.0";
              const isProfit = row.netProfit >= 0;
              const isActive = activeMonth === row.month;

              return (
                <tr
                  key={row.month}
                  style={{
                    background: isActive ? "var(--bg-elevated)" : "transparent",
                    cursor: "pointer",
                    transition: "background var(--transition-fast)",
                  }}
                  onClick={() => setActiveMonth(isActive ? null : row.month)}
                >
                  <td>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      color: isActive ? "var(--primary)" : "var(--text-primary)",
                    }}>
                      {row.month}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--primary)" }}>
                    ₹{(row.revenue / 100000).toFixed(2)}L
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--info)" }}>
                    ₹{(row.fuelCost / 1000).toFixed(1)}k
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--warning)" }}>
                    ₹{(row.maintenance / 1000).toFixed(1)}k
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-md)",
                      color: isProfit ? "var(--primary)" : "var(--danger)",
                    }}>
                      {isProfit ? "+" : ""}₹{(row.netProfit / 100000).toFixed(2)}L
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div
                          className={`progress-fill${parseFloat(margin) < 30 ? " progress-fill--warning" : ""}`}
                          style={{ width: `${Math.min(Math.abs(parseFloat(margin)), 100)}%` }}
                        />
                      </div>
                      <span style={{
                        fontSize: "var(--text-xs)",
                        color: parseFloat(margin) >= 40
                          ? "var(--primary)"
                          : parseFloat(margin) >= 20
                          ? "var(--warning)"
                          : "var(--danger)",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)",
                      }}>
                        {margin}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table footer totals */}
        <div style={{
          padding: "14px 24px",
          borderTop: "2px solid var(--border-accent)",
          display: "flex",
          justifyContent: "flex-end",
          gap: 40,
          background: "var(--bg-elevated)",
        }}>
          {[
            { label: "Total Revenue",  value: monthlyFinancials.reduce((s, r) => s + r.revenue,     0), color: "var(--primary)"  },
            { label: "Total Fuel",     value: monthlyFinancials.reduce((s, r) => s + r.fuelCost,    0), color: "var(--info)"     },
            { label: "Total Maint.",   value: monthlyFinancials.reduce((s, r) => s + r.maintenance, 0), color: "var(--warning)"  },
            { label: "Net Profit",     value: monthlyFinancials.reduce((s, r) => s + r.netProfit,   0), color: "var(--primary)"  },
          ].map((col) => (
            <div key={col.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
                {col.label}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: col.color, lineHeight: 1 }}>
                ₹{(col.value / 100000).toFixed(2)}L
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-Vehicle ROI Table ─────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
          <SectionHeader title="Per-Vehicle ROI Breakdown" accent="var(--info)" />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Plate</th>
              <th>Est. Revenue</th>
              <th>Fuel Cost</th>
              <th>Maint. Cost</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {state.vehicles.map((v) => {
              const roi = getVehicleROI(v.id);
              if (!roi) return null;
              const roiNum = parseFloat(roi.roi);
              const roiColor = roiNum >= 10
                ? "var(--primary)"
                : roiNum >= 0
                ? "var(--warning)"
                : "var(--danger)";

              return (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
                      {v.model}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{v.type}</div>
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
                      color: "var(--text-secondary)",
                    }}>
                      {v.plate}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--primary)" }}>
                    ₹{roi.revenue.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--info)" }}>
                    ₹{roi.fuel.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--warning)" }}>
                    ₹{roi.maint.toLocaleString()}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-lg)",
                      color: roiColor,
                    }}>
                      {roiNum > 0 ? "+" : ""}{roi.roi}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer note ──────────────────────────────────────── */}
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", textAlign: "right", paddingBottom: 8 }}>
        Revenue estimated at 3× fuel cost per trip · ROI = (Revenue − Fuel − Maintenance) / Acquisition Cost
      </div>

    </div>
  );
};

export default Analytics;
