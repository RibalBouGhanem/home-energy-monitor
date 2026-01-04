// src/components/Reports.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios"; // adjust if your axios file path differs
import SearchableSelect from "./SearchableSelect"; // adjust if needed

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sum(rows, key) {
  return (rows || []).reduce((acc, r) => acc + toNum(r?.[key]), 0);
}

function avg(rows, key) {
  if (!rows?.length) return 0;
  return sum(rows, key) / rows.length;
}

function lastN(rows, n) {
  const arr = Array.isArray(rows) ? rows : [];
  // backend usually returns DESC, so slice first n then reverse to chronological
  return arr.slice(0, n).reverse();
}

function formatKwh(v) {
  return `${toNum(v).toFixed(2)} kWh`;
}

export default function Reports() {
  // Monitors from localStorage (saved at login)
  const monitors = useMemo(
    () => safeParse(localStorage.getItem("monitors"), []),
    []
  );

  const monitorOptions = useMemo(() => {
    return (monitors || []).map((m) => {
      const id = String(m?.Monitor_ID ?? m?.monitor_id ?? "");
      const label = m?.Location;
      return { value: id, label };
    });
  }, [monitors]);

  // Store option object to avoid id/index confusion
  const [selectedMonitorOption, setSelectedMonitorOption] = useState(
    () => monitorOptions[0] || null
  );

  // If options load later, set default to first monitor
  useEffect(() => {
    if (!selectedMonitorOption && monitorOptions.length > 0) {
      setSelectedMonitorOption(monitorOptions[0]);
    }
  }, [monitorOptions, selectedMonitorOption]);

  const [selectedMonitorId, setSelectedMonitorId] = useState(monitorOptions[0]?.value);

  // Backend data
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedMonitorId) return;

    setLoading(true);
    setErr("");

    api
      .get(`/api/monitor/${selectedMonitorId}/data`)
      .then((res) => setData(res.data))
      .catch((e) =>
        setErr(e?.response?.data?.message || "Failed to load reports.")
      )
      .finally(() => setLoading(false));
  }, [selectedMonitorId]);

  // Extract arrays safely
  const consumptionDaily = data?._computed_energy_consumption_daily || [];
  const productionDaily = data?._computed_energy_production_daily || [];
  const solarDaily = data?._computed_solar_panel_data_daily || [];
  const envDaily = data?._computed_environmental_data_daily || [];

  // Compute insights
  const cons7 = useMemo(() => lastN(consumptionDaily, 7), [consumptionDaily]);
  const prod7 = useMemo(() => lastN(productionDaily, 7), [productionDaily]);
  const solar7 = useMemo(() => lastN(solarDaily, 7), [solarDaily]);
  const env7 = useMemo(() => lastN(envDaily, 7), [envDaily]);

  const cons7Total = useMemo(() => sum(cons7, "Total_Consumption"), [cons7]);
  const prod7Total = useMemo(() => sum(prod7, "Total_Production"), [prod7]);
  const net7 = useMemo(() => prod7Total - cons7Total, [prod7Total, cons7Total]);

  const solar7Generated = useMemo(
    () => sum(solar7, "Total_Energy_Generated"),
    [solar7]
  );

  const solarContributionPct = useMemo(() => {
    const denom = cons7Total > 0 ? cons7Total : 0;
    if (!denom) return 0;
    // Solar used is at most consumption
    const used = Math.min(solar7Generated, denom);
    return (used / denom) * 100;
  }, [solar7Generated, cons7Total]);

  const avgEfficiency7 = useMemo(
    () => avg(solar7, "Panel_Efficiency"),
    [solar7]
  );

  const avgTemp7 = useMemo(() => avg(env7, "Temperature"), [env7]);
  const avgHumidity7 = useMemo(() => avg(env7, "Humidity"), [env7]);

  // Peak consumption day (from the 7-day window)
  const peakDay = useMemo(() => {
    let best = null;
    for (const r of cons7) {
      const v = toNum(r?.Total_Consumption);
      if (!best || v > best.value) {
        const d = r?.Timestamp || r?.Date;
        best = { date: d, value: v };
      }
    }
    return best;
  }, [cons7]);

  const peakDayLabel = useMemo(() => {
    if (!peakDay?.date) return "—";
    const dt = new Date(peakDay.date);
    return Number.isFinite(dt.getTime())
      ? dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "—";
  }, [peakDay]);

  return (
    <section className="reports-section" id="reports">
      <div className="dashboard-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h2 className="section-title">Reports &amp; Insights</h2>

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

        {loading && <div className="muted" style={{ marginTop: 10 }}>Loading reports...</div>}
        {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}

        <div className="info-grid" style={{ marginTop: 18 }}>
          <div className="info-card">
            <div className="info-icon">🔌</div>
            <h3 className="info-title">7-Day Consumption</h3>
            <div className="info-value">{formatKwh(cons7Total)}</div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Total consumption over the last 7 daily computed records.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3 className="info-title">7-Day Production</h3>
            <div className="info-value">{formatKwh(prod7Total)}</div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Total production over the last 7 daily computed records.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">⚖️</div>
            <h3 className="info-title">Net Energy (7-Day)</h3>
            <div className="info-value">{formatKwh(net7)}</div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Production minus consumption across the last 7 days.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">☀️</div>
            <h3 className="info-title">Solar Contribution</h3>
            <div className="info-value">{solarContributionPct.toFixed(1)}%</div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Estimated share of consumption covered by solar (last 7 days).
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">📈</div>
            <h3 className="info-title">Peak Day (7-Day)</h3>
            <div className="info-value">
              {peakDay ? `${peakDayLabel} • ${formatKwh(peakDay.value)}` : "—"}
            </div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Highest daily consumption in the last 7 days.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">🌡️</div>
            <h3 className="info-title">Environment (7-Day Avg)</h3>
            <div className="info-value">
              {avgTemp7.toFixed(1)}°C • {avgHumidity7.toFixed(1)}%
            </div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Average temperature and humidity from the last 7 records.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">🧪</div>
            <h3 className="info-title">Solar Efficiency (7-Day Avg)</h3>
            <div className="info-value">{avgEfficiency7.toFixed(1)}%</div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Average panel efficiency across the last 7 solar records.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">📦</div>
            <h3 className="info-title">Solar Generated (7-Day)</h3>
            <div className="info-value">{formatKwh(solar7Generated)}</div>
            <p style={{ fontSize: 14, color: "#a0a0a0" }}>
              Total energy generated by solar over the last 7 daily records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
