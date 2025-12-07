// src/components/analytics/charts/DeviceAnalyticsChart.jsx
import React from "react";

export default function DeviceAnalyticsChart({ activePeriod, onChangePeriod }) {
  const periods = ["This Month", "Last Month", "YTD"];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📱 Device Analytics</h3>
        <div className="chart-options">
          {periods.map((label) => (
            <span
              key={label}
              className={`chart-option ${
                activePeriod === label ? "active" : ""
              }`}
              onClick={() => onChangePeriod(label)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <div className="line-chart">
          {/* reuse the same device line SVG from your original component */}
          {/* ...paste SVG here unchanged... */}
        </div>
      </div>
    </div>
  );
}
