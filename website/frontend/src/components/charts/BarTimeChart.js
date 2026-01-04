// src/components/charts/BarTimeChart.js
import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

function toMs(v) {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

// Soft-glow plugin (no extra files)
const softGlowPlugin = {
  id: "softGlowPlugin",
  beforeDatasetDraw(chart, args, pluginOptions) {
    const { ctx } = chart;
    const dataset = chart.data.datasets?.[args.index];
    if (!dataset) return;

    const enabled = pluginOptions?.enabled ?? true;
    if (!enabled) return;

    const intensity = Number(pluginOptions?.intensity ?? 12);
    const alpha = Number(pluginOptions?.alpha ?? 0.25);

    // Chart.js resolves dataset.backgroundColor for us during draw,
    // but we can't reliably get the gradient here. We'll glow with a neutral white.
    ctx.save();
    ctx.shadowColor = `rgba(255,255,255,${alpha})`;
    ctx.shadowBlur = intensity;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // Let the normal draw happen with shadow applied
  },
  afterDatasetDraw(chart, args) {
    const { ctx } = chart;
    ctx.restore();
  },
};

export default function BarTimeChart({
  id,
  rows = [],
  xKey = "Timestamp",
  yKeys = [],
  labels = {}, // { yKey: "Label" }
  chartRef, // optional ref object
  maxBars = 14, // keeps it clean
  glow = true, // enable/disable glow
}) {
  const canvasRef = useRef(null);

  const prepared = useMemo(() => {
    const src = Array.isArray(rows) ? rows : [];
    const mapped = src
      .map((r) => {
        const ms = toMs(r?.[xKey]);
        if (ms == null) return null;
        return { ...r, __ms: ms };
      })
      .filter(Boolean)
      .sort((a, b) => a.__ms - b.__ms);

    if (maxBars && mapped.length > maxBars) {
      return mapped.slice(mapped.length - maxBars);
    }
    return mapped;
  }, [rows, xKey, maxBars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy previous chart if exists
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    if (!prepared.length || !Array.isArray(yKeys) || yKeys.length === 0) return;

    const xLabels = prepared.map((r) => r.__ms);

    // Use default chart colors, but stylize via gradients.
    // We create a "glass" gradient based on each dataset's base color.
    const makeThemeGradient = (ctx, chartArea, theme) => {
        const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

        // Default fallback (teal glass)
        const themes = {
            solar: {
            top: "rgba(0, 255, 204, 0.45)",
            mid: "rgba(0, 200, 180, 0.65)",
            bottom: "rgba(0, 160, 150, 0.25)",
            },
            reserves: {
            top: "rgba(0, 180, 255, 0.45)",
            mid: "rgba(0, 140, 220, 0.65)",
            bottom: "rgba(0, 90, 180, 0.25)",
            },
            default: {
            top: "rgba(0, 200, 255, 0.35)",
            mid: "rgba(0, 160, 220, 0.55)",
            bottom: "rgba(0, 120, 180, 0.25)",
            },
        };

        const c = themes[theme] || themes.default;

        g.addColorStop(0.0, c.top);     // highlight
        g.addColorStop(0.35, c.mid);    // body
        g.addColorStop(1.0, c.bottom);  // fade

        return g;
        };


    const datasets = yKeys.map((k) => ({
      label: labels?.[k] || k,
      data: prepared.map((r) => {
        const n = Number(r?.[k]);
        return Number.isFinite(n) ? n : null;
      }),

      // “template” look
      borderWidth: 1,
      borderRadius: 14,
      borderSkipped: false,
      barPercentage: yKeys.length > 1 ? 0.62 : 0.75,
      categoryPercentage: yKeys.length > 1 ? 0.74 : 0.7,

      // Nice hover
      hoverBorderWidth: 1.5,

      // Glass gradient fill (scriptable)
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;

        // chartArea is undefined on first render
        if (!chartArea) return "rgba(255,255,255,0.18)";

        const label = (context?.dataset.label || "").toLowerCase();

        let theme = "default";
        if (label.includes("solar") || label.includes("efficiency")) theme = "solar";
        if (label.includes("reserve")) theme = "reserves";

        return makeThemeGradient(ctx, chartArea, theme);
      },

      // Subtle outline
      borderColor: "rgba(255,255,255,0.20)",
    }));

    const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: xLabels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10, right: 10, bottom: 0, left: 10 },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: yKeys.length > 1,
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            displayColors: yKeys.length > 1,
            backgroundColor: "rgba(0,0,0,0.65)",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            titleColor: "rgba(255,255,255,0.95)",
            bodyColor: "rgba(255,255,255,0.9)",
            padding: 10,
            callbacks: {
              title: (items) => {
                const raw = items?.[0]?.label;
                const ms = toMs(raw);
                return ms
                  ? new Date(ms).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "";
              },
            },
          },

          // Our glow plugin config
          softGlowPlugin: {
            enabled: glow,
            intensity: 14,
            alpha: 0.22,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              callback: (_val, idx) => {
                const ms = prepared[idx]?.__ms;
                if (!ms) return "";
                return new Date(ms).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false,
              color: "rgba(255,255,255,0.06)",
            },
            ticks: {
              precision: 0,
              maxTicksLimit: 5,
            },
          },
        },
      },
      plugins: [softGlowPlugin],
    });

    if (chartRef) chartRef.current = chart;

    return () => {
      chart.destroy();
      if (chartRef) chartRef.current = null;
    };
  }, [prepared, yKeys, labels, chartRef, glow]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas id={id} ref={canvasRef} />
    </div>
  );
}
