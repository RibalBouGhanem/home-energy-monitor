// src/components/analytics/charts/MonthlyTrendsChart.jsx
import React from "react";
import { useSlideUpOnView } from "../hooks";

export default function MonthlyTrendsChart({ activeYear, onChangeYear }) {
  const chartRef = useSlideUpOnView();
  const years = ["2024", "2023", "2022"];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📈 Monthly Trends</h3>
        <div className="chart-options">
          {years.map((year) => (
            <span
              key={year}
              className={`chart-option ${
                activeYear === year ? "active" : ""
              }`}
              onClick={() => onChangeYear(year)}
            >
              {year}
            </span>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <div className="bar-chart" id="barChart" ref={chartRef}>
          {/* reuse your same bar markup here */}
          <div className="bar" style={{ height: "60%" }}>
            <span className="bar-value">120</span>
            <span className="bar-label">Jan</span>
          </div>
          <div className="bar" style={{ height: "80%" }}>
            <span className="bar-value">180</span>
            <span className="bar-label">Feb</span>
          </div>
          <div className="bar" style={{ height: "45%" }}>
            <span className="bar-value">90</span>
            <span className="bar-label">Mar</span>
          </div>
          {/* ...copy the rest of your bars (Apr–Aug) from the old component */}
        </div>
      </div>
    </div>
  );
}
