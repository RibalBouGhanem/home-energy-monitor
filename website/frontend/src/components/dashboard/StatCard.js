// src/components/dashboard/StatCard.jsx
import React, { useEffect, useRef } from "react";

function drawSparkline(canvas, data, color) {
  if (!canvas || !data?.length) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  const cssWidth = canvas.clientWidth || 160;
  const cssHeight = canvas.clientHeight || 40;

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = 4;
  const w = cssWidth - pad * 2;
  const h = cssHeight - pad * 2;

  const x = (i) => pad + (i * w) / (data.length - 1);
  const y = (v) => pad + h - ((v - min) / range) * h;

  // soft baseline
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = color || "#00ccff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad + h);
  ctx.lineTo(pad + w, pad + h);
  ctx.stroke();

  // line
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color || "#00ccff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((v, i) => {
    if (i === 0) ctx.moveTo(x(i), y(v));
    else ctx.lineTo(x(i), y(v));
  });
  ctx.stroke();

  // last point
  const lastX = x(data.length - 1);
  const lastY = y(data[data.length - 1]);
  ctx.fillStyle = color || "#00ccff";
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

export default function StatCard({
  icon,
  title,
  value,
  description,
  color,
  series,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawSparkline(canvasRef.current, series, color);
  }, [series, color]);

  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">{icon}</div>
        <div className="stat-title">{title}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-description">{description}</div>
      <div className="stat-chart">
        <canvas
          ref={canvasRef}
          className="mini-chart"
          style={{ width: "160px", height: "40px" }}
        />
      </div>
    </div>
  );
}
