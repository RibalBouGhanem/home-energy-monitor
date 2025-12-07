// src/components/analytics/charts/GeoDistributionChart.jsx
import React from "react";

export default function GeoDistributionChart({ activeRegion, onChangeRegion }) {
  const regions = ["Global", "US", "EU"];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">🌍 Geographic Distribution</h3>
        <div className="chart-options">
          {regions.map((label) => (
            <span
              key={label}
              className={`chart-option ${
                activeRegion === label ? "active" : ""
              }`}
              onClick={() => onChangeRegion(label)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <div className="bar-chart">
          {/* same four bars from your original component */}
          {/* ...paste bars here unchanged... */}
        </div>
      </div>
    </div>
  );
}
