// src/components/analytics/charts/DeviceAnalyticsChart.jsx
import React, { useMemo } from "react";

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function DeviceAnalyticsChart({
  title = "🪫 Reserves Trend",
  subtitle = "",
  reservesDaily = [],
  solarTodayGenerated = 0,
}) {
  const { values, max } = useMemo(() => {
    const values = (reservesDaily || []).map((r) => safeNum(r?.Reserve_Amount));
    const max = Math.max(1, ...values);
    return { values, max };
  }, [reservesDaily]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="muted" style={{ fontSize: 12 }}>{subtitle}</div>
      </div>

      <div className="chart-container">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(values.length, 1)}, 1fr)`, gap: 6, alignItems: "end", height: 120 }}>
          {values.map((v, i) => (
            <div key={i} style={{ height: `${Math.round((v / max) * 100)}%`, borderRadius: 8, background: "rgba(0, 255, 204, 0.55)" }} />
          ))}
        </div>

        <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          Solar generated today: {safeNum(solarTodayGenerated).toFixed(2)} kWh
        </div>
      </div>
    </div>
  );
}
