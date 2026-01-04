// src/components/analytics/charts/MonthlyTrendsChart.jsx
import React, { useMemo } from "react";
import { useSlideUpOnView } from "../hooks/hooks";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function MonthlyTrendsChart({
  activeYear,
  onChangeYear,
  consumptionMonthly = [],
  productionMonthly = [],
}) {
  const chartRef = useSlideUpOnView();
  const years = ["2026", "2025", "2024", "2023", "2022"];

  const bars = useMemo(() => {
    const y = Number(activeYear);

    const consByMonth = new Array(12).fill(0);
    const prodByMonth = new Array(12).fill(0);

    consumptionMonthly.forEach((r) => {
      if (Number(r?.Year) !== y) return;
      const m = Number(r?.Month);
      if (m >= 1 && m <= 12) consByMonth[m - 1] = safeNum(r?.Total_Consumption);
    });

    productionMonthly.forEach((r) => {
      if (Number(r?.Year) !== y) return;
      const m = Number(r?.Month);
      if (m >= 1 && m <= 12) prodByMonth[m - 1] = safeNum(r?.Total_Production);
    });

    const max = Math.max(1, ...consByMonth, ...prodByMonth);

    return MONTHS.map((label, i) => ({
      label,
      cons: consByMonth[i],
      prod: prodByMonth[i],
      consH: Math.round((consByMonth[i] / max) * 100),
      prodH: Math.round((prodByMonth[i] / max) * 100),
    }));
  }, [activeYear, consumptionMonthly, productionMonthly]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📈 Monthly Energy (Consumption vs Production)</h3>
        <div className="chart-options">
          {years.map((year) => (
            <span
              key={year}
              className={`chart-option ${activeYear === year ? "active" : ""}`}
              onClick={() => onChangeYear(year)}
            >
              {year}
            </span>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <div className="bar-chart" ref={chartRef} style={{ gap: 10 }}>
          {bars.map((b) => (
            <div key={b.label} className="bar" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {/* Production bar (top) */}
              <div style={{ height: `${b.prodH}%`, borderRadius: 10, background: "rgba(255, 204, 0, 0.65)", marginBottom: 6 }} />
              {/* Consumption bar (bottom) */}
              <div style={{ height: `${b.consH}%`, borderRadius: 10, background: "rgba(0, 204, 255, 0.65)" }} />
              <span className="bar-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
