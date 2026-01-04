// src/components/analytics/EnergyMixPie.jsx
import React, { useMemo } from "react";

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function sum(rows, key) {
  return (rows || []).reduce((a, r) => a + num(r?.[key]), 0);
}

function polar(cx, cy, r, a) {
  const rad = ((a - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const s = polar(cx, cy, r, endAngle);
  const e = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} L ${cx} ${cy} Z`;
}

export default function EnergyMixPie({ consumptionRows, productionRows, solarRows }) {
  const { parts, total } = useMemo(() => {
    // 7-day window based on what you pass (you can slice before passing if you want)
    const cons = sum(consumptionRows, "Total_Consumption");
    const prod = sum(productionRows, "Total_Production");
    const solar = sum(solarRows, "Total_Energy_Generated");

    // Simple “mix”:
    // - Solar portion: solar (capped to consumption if you want)
    // - Grid portion: max(cons - solar, 0)
    // - Excess (if producing more than consuming): max(prod - cons, 0)
    const solarUsed = Math.min(solar, cons);
    const grid = Math.max(cons - solarUsed, 0);
    const excess = Math.max(prod - cons, 0);

    const parts = [
      { label: "Solar Used", value: solarUsed },
      { label: "From Grid", value: grid },
      { label: "Excess Production", value: excess },
    ].filter((p) => p.value > 0);

    const total = parts.reduce((a, p) => a + p.value, 0) || 1;
    return { parts, total };
  }, [consumptionRows, productionRows, solarRows]);

  const cx = 80, cy = 80, r = 70;
  let angle = 0;

  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {parts.map((p, i) => {
          const start = angle;
          const sweep = (p.value / total) * 360;
          const end = start + sweep;
          angle = end;

          // no hardcoded colors; use CSS-ish opacity variations
          const fill = i === 0 ? "rgba(255,255,255,0.75)"
                     : i === 1 ? "rgba(255,255,255,0.45)"
                     : "rgba(255,255,255,0.25)";

          return <path key={p.label} d={arcPath(cx, cy, r, start, end)} fill={fill} />;
        })}

        {/* donut hole */}
        <circle cx={cx} cy={cy} r={42} fill="rgba(0,0,0,0.35)" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12">
          Mix
        </text>
      </svg>

      <div style={{ display: "grid", gap: 8 }}>
        {parts.map((p, i) => (
          <div key={p.label} className="muted" style={{ fontSize: 13 }}>
            <b style={{ color: "inherit" }}>{p.label}:</b>{" "}
            {p.value.toFixed(2)} kWh ({((p.value / total) * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    </div>
  );
}
