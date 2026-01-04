// src/components/analytics/Analytics.jsx
import React, { useMemo, useState } from "react";

import MetricsGrid from "./MetricsGrid";

// Your existing chart components
import ChartCard from "../charts/ChartCard";
import LineTimeChart from "../charts/LineTimeChart";
import BarTimeChart from "../charts/BarTimeChart";

import SearchableSelect from "../SearchableSelect";
// Your backend hook (must exist in src/components/analytics/hooks/useAnalyticsData.js)
import { useAnalyticsData } from "./hooks/useAnalyticsData";

/** Safe JSON parse for localStorage */
function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/** Convert a date-like value to ms timestamp */
function toMs(v) {
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Normalizes rows into:
 * - ensures `Timestamp` is numeric ms for Chart.js
 * - sorts ascending by Timestamp
 *
 * dateKey is the preferred source field (e.g., "Timestamp", "Date_Calculated", "Date")
 */
function normalizeTimeRows(rows, dateKey) {
  const src = Array.isArray(rows) ? rows : [];
  return src
    .map((r) => {
      const raw = r?.[dateKey] ?? r?.Timestamp ?? r?.Date ?? r?.Date_Calculated;
      const ms = toMs(raw);
      if (ms == null) return null;
      return { ...r, Timestamp: ms };
    })
    .filter(Boolean)
    .sort((a, b) => a.Timestamp - b.Timestamp);
}

/**
 * Normalizes monthly rows (Month/Year) into Timestamp for first of that month.
 */
function normalizeMonthlyRows(rows) {
  const src = Array.isArray(rows) ? rows : [];
  return src
    .map((r) => {
      const y = Number(r?.Year);
      const m = Number(r?.Month);
      if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
      const ms = toMs(`${y}-${String(m).padStart(2, "0")}-01`);
      if (ms == null) return null;
      return { ...r, Timestamp: ms };
    })
    .filter(Boolean)
    .sort((a, b) => a.Timestamp - b.Timestamp);
}

/**
 * Merge monthly consumption & production by Timestamp so one chart can plot both.
 * Safe even if arrays are different lengths or missing months.
 */
function mergeMonthly(consMonthly, prodMonthly) {
  const map = new Map();

  (consMonthly || []).forEach((r) => {
    map.set(r.Timestamp, { Timestamp: r.Timestamp, Total_Consumption: Number(r?.Total_Consumption) || 0 });
  });

  (prodMonthly || []).forEach((r) => {
    const prev = map.get(r.Timestamp) || { Timestamp: r.Timestamp, Total_Consumption: 0 };
    map.set(r.Timestamp, { ...prev, Total_Production: Number(r?.Total_Production) || 0 });
  });

  return Array.from(map.values()).sort((a, b) => a.Timestamp - b.Timestamp);
}




export default function Analytics() {
  // 1) Get first monitorId from localStorage
  const monitors = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("monitors") || "[]");
    } catch {
      return [];
    }
  }, []);
  
  const monitorOptions = useMemo(() => {
    return monitors.map((m) => {
      const id = String(m.Monitor_ID);
      const label = m.Location
      return { value: id, label };
    });
  }, [monitors]);

  const [selectedMonitorId, setSelectedMonitorId] = useState(monitorOptions[0]?.value);

  const analytics = useAnalyticsData(selectedMonitorId);
  console.log(monitorOptions[selectedMonitorId]);
  // 2) Fetch + computed values from backend hook

  // Define EVERYTHING we use (no undefined variables)
  const loading = analytics?.loading ?? false;
  const err = analytics?.err ?? "";

  const todayCons = Number(analytics?.todayCons) || 0;
  const todayProd = Number(analytics?.todayProd) || 0;

  const solarTodayEff = Number(analytics?.solarTodayEff) || 0;
  const avgTemp7 = Number(analytics?.avgTemp7) || 0;
  const avgHumidity7 = Number(analytics?.avgHumidity7) || 0;

  // Raw arrays (fallback to empty arrays)
  const consD = analytics?.consD || [];
  const prodD = analytics?.prodD || [];
  const resD = analytics?.resD || [];
  const solD = analytics?.solD || [];
  const consM = analytics?.consM || [];
  const prodM = analytics?.prodM || [];

  // 3) Normalize datasets for charts (no undefined)
  const consDaily = useMemo(() => normalizeTimeRows(consD, "Timestamp"), [consD]);
  const prodDaily = useMemo(() => normalizeTimeRows(prodD, "Timestamp"), [prodD]);

  // Reserves daily often uses Timestamp/Date; normalize with "Timestamp" preference
  const reservesDaily = useMemo(() => normalizeTimeRows(resD, "Timestamp"), [resD]);

  // Solar daily uses Date_Calculated in your project schema
  const solarDaily = useMemo(() => normalizeTimeRows(solD, "Date_Calculated"), [solD]);

  // Monthly
  const consMonthly = useMemo(() => normalizeMonthlyRows(consM), [consM]);
  const prodMonthly = useMemo(() => normalizeMonthlyRows(prodM), [prodM]);
  const monthlyMerged = useMemo(
    () => mergeMonthly(consMonthly, prodMonthly),
    [consMonthly, prodMonthly]
  );

  return (
    <section className="analytics-section" id="analytics">
      <div className="dashboard-container">
        <h2 className="section-title">Advanced Analytics</h2>

        {!selectedMonitorId && (
          <div className="muted" style={{ marginTop: 10 }}>
            No monitor found for this account.
          </div>
        )}

        {loading && selectedMonitorId && (
          <div className="muted" style={{ marginTop: 10 }}>
            Loading analytics...
          </div>
        )}

        {err && (
          <div className="error" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          {selectedMonitorId && <h2 className="section-title">{monitorOptions[selectedMonitorId - 1].label}</h2>}

          <div className="form-group">
            <SearchableSelect
              options={monitorOptions}
              value={selectedMonitorId}
              onChange={setSelectedMonitorId}
              placeholder="Select monitor"
              allowAll={false}
              isDisabled={monitorOptions.length === 0}
            />
          </div>
        </div>

        {/* If your MetricsGrid still uses the template data internally, this will still render.
            If you already refactored MetricsGrid to accept props, pass metrics here. */}
        <MetricsGrid
          metrics={[
            { value: `${todayCons.toFixed(2)} kWh`, label: "Today's Consumption" },
            { value: `${todayProd.toFixed(2)} kWh`, label: "Today's Production" },
            { value: `${solarTodayEff.toFixed(1)}%`, label: "Solar Efficiency (Today)" },
            { value: `${avgTemp7.toFixed(1)}°C`, label: "Avg Temp (7d)" },
            { value: `${avgHumidity7.toFixed(1)}%`, label: "Avg Humidity (7d)" },
          ]}
        />

        <div className="charts-grid">
          <ChartCard title="Daily Consumption (kWh)">
            <LineTimeChart rows={consDaily} xKey="Timestamp" yKeys={["Total_Consumption"]} />
          </ChartCard>

          <ChartCard title="Daily Production (kWh)">
            <LineTimeChart rows={prodDaily} xKey="Timestamp" yKeys={["Total_Production"]} />
          </ChartCard>

          <ChartCard title="Monthly Consumption vs Production">
            <LineTimeChart
              rows={monthlyMerged}
              xKey="Timestamp"
              yKeys={["Total_Consumption", "Total_Production"]}
            />
          </ChartCard>

          {/* BAR: Solar efficiency */}
          <ChartCard title="Solar Panel Efficiency (Daily)">
            <BarTimeChart
              rows={solarDaily}
              xKey="Timestamp"
              yKeys={["Panel_Efficiency"]}
              labels={{ Panel_Efficiency: "Efficiency (%)" }}
            />
          </ChartCard>

          {/* BAR: Reserves */}
          <ChartCard title="Energy Reserves (Daily)">
            <BarTimeChart
              rows={reservesDaily}
              xKey="Timestamp"
              yKeys={["Reserve_Amount"]}
              labels={{ Reserve_Amount: "Reserves" }}
            />
          </ChartCard>

          {/* Optional: bar for solar generated */}
          <ChartCard title="Solar Generated (Daily)">
            <BarTimeChart
              rows={solarDaily}
              xKey="Timestamp"
              yKeys={["Total_Energy_Generated"]}
              labels={{ Total_Energy_Generated: "kWh" }}
            />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
