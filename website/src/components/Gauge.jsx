import React from "react";

/*
  This gauge is a decorative, responsive semicircle using SVG.
  You can later set 'value' (0..1) to draw the active arc.
*/

export default function Gauge({ value = 0.32 }) {
  // Gauge geometry
  const size = 360;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semicircle path start/end (we draw an arc from 180deg to 0deg)
  // For simplicity we compute strokeDasharray based on value.
  const circumference = Math.PI * radius; // semicircle length
  const offset = circumference * (1 - value);

  return (
    <div className="gauge-wrap">
      <svg width="100%" viewBox={`0 0 ${size} ${size / 1.1}`} className="gauge-svg">
        <defs>
          <linearGradient id="grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#2ecc71" />
            <stop offset="100%" stopColor="#58a6ff" />
          </linearGradient>
        </defs>

        {/* background arc */}
        <path
          d={`${describeSemicircle(cx, cy, radius)}`}
          fill="none"
          stroke="#0f1b20"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* active arc */}
        <path
          d={`${describeSemicircle(cx, cy, radius)}`}
          fill="none"
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(0 ${cx} ${cy})`}
          style={{ filter: "drop-shadow(0 6px 10px rgba(80,200,220,0.07))" }}
        />
      </svg>

      {/* Inner content */}
      <div className="gauge-inner">
        <div className="gauge-title">Home energy use</div>
        <div className="gauge-values">— —</div>
      </div>
    </div>
  );
}

/* helper to produce semicircle path from left to right (180deg to 0deg) */
function describeSemicircle(cx, cy, r) {
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;
  // large-arc-flag = 0, sweep-flag = 1 draws lower arc (we want upper semicircle so we offset cy slightly)
  // Use arc command with rx, ry same = r
  return `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
}
