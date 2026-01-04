// src/components/analytics/MetricsGrid.jsx
import React from "react";
import { useMetricsAnimation } from "./hooks";

const METRICS = [
  { value: "2.4M", label: "Page Views" },
  { value: "156K", label: "Unique Visitors" },
  { value: "4.2min", label: "Avg Session" },
  { value: "68%", label: "Return Rate" },
  { value: "89", label: "NPS Score" },
  { value: "3.2K", label: "Daily Active" },
];

export default function MetricsGrid() {
  const ref = useMetricsAnimation();

  return (
    <div className="metrics-grid" ref={ref}>
      {METRICS.map((m) => (
        <div key={m.label} className="metric-item">
          <div className="metric-value">{m.value}</div>
          <div className="metric-label">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
