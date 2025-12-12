// src/components/analytics/charts/GrowthAnalyticsChart.jsx
import React from "react";

export default function GrowthAnalyticsChart({ activeRange, onChangeRange }) {
  const ranges = ["Week", "Month", "Year"];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📊 Growth Analytics</h3>
        <div className="chart-options">
          {ranges.map((label) => (
            <span
              key={label}
              className={`chart-option ${
                activeRange === label ? "active" : ""
              }`}
              onClick={() => onChangeRange(label)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <div className="line-chart">
          {/* reuse the same SVG from your original Growth Analytics */}
          {/* ...paste SVG here unchanged... */}
        </div>
      </div>
    </div>
  );
}
