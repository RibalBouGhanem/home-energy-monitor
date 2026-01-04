// src/hooks/useDashboardStats.js
import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

function sum(arr, key) {
  return (arr || []).reduce((acc, r) => acc + (Number(r?.[key]) || 0), 0);
}

function lastN(arr, n) {
  return (arr || []).slice(0, n).reverse(); // your API orders DESC, sparkline wants oldest->newest
}

function toSeries(rows, key) {
  return rows.map((r) => Number(r?.[key]) || 0);
}

function pickToday(rows, key) {
  // because you ORDER BY Timestamp DESC, rows[0] is the latest day
  return Number(rows?.[0]?.[key]) || 0;
}

export function useDashboardStats(monitorId) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!monitorId) return;

    // last 7 days range (simple client-side range)
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6);

    const fmt = (d) => d.toISOString().slice(0, 10);

    api
      .get(`/api/monitor/${monitorId}/data`, {
        params: { from: fmt(from), to: fmt(to) },
      })
      .then((res) => setData(res.data))
      .catch((e) => setErr(e?.response?.data?.message || "Failed to load dashboard data"));
  }, [monitorId]);

  const stats = useMemo(() => {
    if (!data) return [];

    const consD = data._computed_energy_consumption_daily || [];
    const prodD = data._computed_energy_production_daily || [];
    const resD  = data._computed_energy_reserves_daily || [];
    const solD  = data._computed_solar_panel_data_daily || [];

    const cons7 = lastN(consD, 7);
    const prod7 = lastN(prodD, 7);

    const todayCons = pickToday(consD, "Total_Consumption");
    const todayProd = pickToday(prodD, "Total_Production");
    const netToday = todayProd - todayCons;

    const seriesCons = toSeries(cons7, "Total_Consumption");
    const seriesProd = toSeries(prod7, "Total_Production");

    const todayReserve = Number(resD?.[0]?.Reserve_Amount) || 0;

    // solar: choose the most “headline” metric
    const todaySolarGenerated = Number(solD?.[0]?.Total_Energy_Generated) || 0;
    const todayEfficiency = Number(solD?.[0]?.Panel_Efficiency) || 0;

    return [
      {
        icon: "🔌",
        title: "Today's Consumption",
        value: `${todayCons.toFixed(2)} kWh`,
        description: "Latest daily computed consumption.",
        color: "#00ccff",
        series: seriesCons,
      },
      {
        icon: "☀️",
        title: "Today's Production",
        value: `${todayProd.toFixed(2)} kWh`,
        description: "Latest daily computed production.",
        color: "#ffcc00",
        series: seriesProd,
      },
      {
        icon: "⚖️",
        title: "Net Energy Today",
        value: `${netToday.toFixed(2)} kWh`,
        description: netToday >= 0 ? "Producing more than consuming." : "Consuming more than producing.",
        color: netToday >= 0 ? "#4ecdc4" : "#ff6b6b",
        series: seriesProd.map((v, i) => v - (seriesCons[i] ?? 0)),
      },
      {
        icon: "🔋",
        title: "Reserve Amount",
        value: `${todayReserve.toFixed(2)} kWh`,
        description: "Latest daily reserve value.",
        color: "#00ffcc",
        series: toSeries(lastN(resD, 7), "Reserve_Amount"),
      },
      {
        icon: "⚡",
        title: "Solar Generated Today",
        value: `${todaySolarGenerated.toFixed(2)} kWh`,
        description: `Panel efficiency: ${todayEfficiency.toFixed(1)}%`,
        color: "#ff0080",
        series: toSeries(lastN(solD, 7), "Total_Energy_Generated"),
      },
      {
        icon: "📈",
        title: "7-Day Consumption Total",
        value: `${sum(cons7, "Total_Consumption").toFixed(2)} kWh`,
        description: "Sum of last 7 daily values.",
        color: "#00ccff",
        series: seriesCons,
      },
    ];
  }, [data]);

  return { stats, data, err, loading: !data && !err };
}
