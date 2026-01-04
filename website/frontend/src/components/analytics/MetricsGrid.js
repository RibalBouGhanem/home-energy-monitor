// src/components/analytics/MetricsGrid.js
import React from "react";

export default function MetricsGrid({ metrics = [] }) {
  // metrics: [{ label: string, value: string, sub?: string }]
  return (
    <div className="metrics-grid">
      {metrics.map((m) => (
        <div key={m.label} className="metric-item">
          <div className="metric-value">{m.value}</div>
          <div className="metric-label">{m.label}</div>
          {m.sub ? <div className="metric-sub">{m.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}
