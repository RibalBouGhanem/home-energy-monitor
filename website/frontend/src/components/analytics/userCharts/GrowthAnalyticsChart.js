// src/components/analytics/charts/GrowthAnalyticsChart.jsx
import React, { useMemo } from "react";

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function seriesFrom(rows, key) {
  // rows already ASC (we pass cons7/cons30 already ASC from hook)
  return (rows || []).map((r) => safeNum(r?.[key]));
}

export default function GrowthAnalyticsChart({
  activeRange,
  onChangeRange,
  consumptionDaily = [],
  consumptionDaily30 = [],
  productionDaily = [],
  productionDaily30 = [],
}) {
  const ranges = ["Week", "Month", "Year"];

  const { cons, prod } = useMemo(() => {
    if (activeRange === "Week") {
      return {
        cons: seriesFrom(consumptionDaily, "Total_Consumption"),
        prod: seriesFrom(productionDaily, "Total_Production"),
      };
    }
    if (activeRange === "Month") {
      return {
        cons: seriesFrom(consumptionDaily30, "Total_Consumption"),
        prod: seriesFrom(productionDaily30, "Total_Production"),
      };
    }
    // Year: if you don’t have 365 daily points loaded here, we reuse 30 days.
    return {
      cons: seriesFrom(consumptionDaily30, "Total_Consumption"),
      prod: seriesFrom(productionDaily30, "Total_Production"),
    };
  }, [activeRange, consumptionDaily, consumptionDaily30, productionDaily, productionDaily30]);

  const max = Math.max(1, ...cons, ...prod);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📊 Consumption vs Production Trend</h3>
        <div className="chart-options">
          {ranges.map((label) => (
            <span
              key={label}
              className={`chart-option ${activeRange === label ? "active" : ""}`}
              onClick={() => onChangeRange(label)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="chart-container">
        {/* lightweight “spark bars” (no external libs, no SVG needed) */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(cons.length, 1)}, 1fr)`, gap: 4, alignItems: "end", height: 120 }}>
          {cons.map((c, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "flex-end" }}>
              <div style={{ height: `${Math.round((safeNum(prod[i]) / max) * 100)}%`, borderRadius: 6, background: "rgba(255, 204, 0, 0.65)" }} />
              <div style={{ height: `${Math.round((safeNum(c) / max) * 100)}%`, borderRadius: 6, background: "rgba(0, 204, 255, 0.65)" }} />
            </div>
          ))}
        </div>

        <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          Yellow = Production, Blue = Consumption
        </div>
      </div>
    </div>
  );
}
