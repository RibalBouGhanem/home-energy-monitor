import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

function toTs(v) {
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

export default function LineTimeChart({
  id,
  rows = [],
  xKey = "Timestamp",
  yKeys = [],
  labels = {}, // optional: { yKey: "Label" }
  chartRef,    // optional: ref passed from parent for hover sync later
  onHoverX,
}) {
  const canvasRef = useRef(null);
  const onHoverXRef = useRef(null);

  const prepared = useMemo(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const data = safeRows
      .map((r) => {
        const x = r?.[xKey];
        const ts = toTs(x);
        if (!ts) return null;
        return { ...r, __ts: ts };
      })
      .filter(Boolean)
      .sort((a, b) => a.__ts - b.__ts);

    return data;
  }, [rows, xKey]);

  useEffect(() => {
    onHoverXRef.current = onHoverX || null;
  }, [onHoverX]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // destroy existing chart if any
    const existing = Chart.getChart(canvasRef.current);
    if (existing) existing.destroy();

    if (!prepared.length || !yKeys.length) return;

    const datasets = yKeys.map((k) => ({
      label: labels[k] || k,
      data: prepared.map((r) => Number(r?.[k] ?? null)),
      spanGaps: true,
      tension: 0.3,
      pointRadius: 0,
    }));

    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: prepared.map((r) => r.__ts), // store timestamps
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        onHover: (_event, elements, chart) => {
          const cb = onHoverXRef.current;
          if (!cb) return;

          if (elements && elements.length) {
            const idx = elements[0].index;
            const x = chart.data.labels?.[idx] ?? null;
            cb(x, idx);
          } else {
            cb(null, null);
          }
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              title: (items) => {
                const v = items?.[0]?.label;
                return v ? new Date(Number(v)).toLocaleString() : "";
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (v, idx, ticks) => {
                const ts = ticks?.[idx]?.value;
                return ts ? new Date(Number(ts)).toLocaleDateString() : "";
              },
              maxRotation: 0,
              autoSkip: true,
            },
          },
          y: {
            ticks: { precision: 0 },
          },
        },
      },
    });

    // expose chart instance to parent if requested
    if (chartRef) chartRef.current = chart;

    return () => {
      chart.destroy();
      if (chartRef) chartRef.current = null;
    };
  }, [prepared, yKeys, labels]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas id={id} ref={canvasRef} />
    </div>
  );
}
