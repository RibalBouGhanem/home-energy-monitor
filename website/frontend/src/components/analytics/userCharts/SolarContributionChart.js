// src/components/analytics/charts/GeoDistributionChart.jsx
import React, { useMemo } from "react";

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function GeoDistributionChart({
  title = "☀️ Solar Contribution",
  subtitle = "",
  solarDaily = [],
  consumptionDaily = [],
}) {
  const { solarTotal, consTotal, pct } = useMemo(() => {
    const solarTotal = solarDaily.reduce((a, r) => a + safeNum(r?.Total_Energy_Generated), 0);
    const consTotal = consumptionDaily.reduce((a, r) => a + safeNum(r?.Total_Consumption), 0);
    const pct = consTotal > 0 ? (solarTotal / consTotal) * 100 : 0;
    return { solarTotal, consTotal, pct };
  }, [solarDaily, consumptionDaily]);

  const solarH = Math.min(100, Math.round(pct));
  const gridH = Math.max(0, 100 - solarH);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="muted" style={{ fontSize: 12 }}>{subtitle}</div>
      </div>

      <div className="chart-container">
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", height: 140 }}>
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ marginBottom: 6 }}>Solar</div>
            <div style={{ height: `${solarH}%`, borderRadius: 10, background: "rgba(255, 204, 0, 0.65)" }} />
            <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
              {solarTotal.toFixed(2)} kWh ({pct.toFixed(1)}%)
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="muted" style={{ marginBottom: 6 }}>From Grid</div>
            <div style={{ height: `${gridH}%`, borderRadius: 10, background: "rgba(255, 107, 107, 0.55)" }} />
            <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
              {(Math.max(consTotal - solarTotal, 0)).toFixed(2)} kWh
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
