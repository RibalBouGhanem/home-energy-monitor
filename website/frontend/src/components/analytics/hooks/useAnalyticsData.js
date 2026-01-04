// src/components/analytics/hooks/useAnalyticsData.js
import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sum(rows, key) {
  return (rows || []).reduce((acc, r) => acc + safeNum(r?.[key]), 0);
}

function avg(rows, key) {
  if (!rows?.length) return 0;
  return sum(rows, key) / rows.length;
}

function lastNDescToAsc(rows, n) {
  // backend usually returns DESC; charts prefer ASC
  return (rows || []).slice(0, n).reverse();
}

export function useAnalyticsData(monitorId) {
  const [raw, setRaw] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!monitorId) return;

    setLoading(true);
    setErr("");

    // IMPORTANT: keep it simple and reliable: fetch all, then slice/filter client-side
    api
      .get(`/api/monitor/${monitorId}/data`)
      .then((res) => setRaw(res.data))
      .catch((e) => setErr(e?.response?.data?.message || "Failed to load analytics data."))
      .finally(() => setLoading(false));
  }, [monitorId]);

  const computed = useMemo(() => {
    const consD = raw?._computed_energy_consumption_daily || [];
    const prodD = raw?._computed_energy_production_daily || [];
    const resD = raw?._computed_energy_reserves_daily || [];
    const envD = raw?._computed_environmental_data_daily || [];
    const solD = raw?._computed_solar_panel_data_daily || [];

    const consM = raw?._computed_energy_consumption_monthly || [];
    const prodM = raw?._computed_energy_production_monthly || [];
    const resM = raw?._computed_energy_reserves_monthly || [];
    const solM = raw?._computed_solar_panel_data_monthly || [];

    // Recent windows (daily)
    const cons7 = lastNDescToAsc(consD, 7);
    const cons30 = lastNDescToAsc(consD, 30);
    const prod7 = lastNDescToAsc(prodD, 7);
    const prod30 = lastNDescToAsc(prodD, 30);

    const solar7 = lastNDescToAsc(solD, 7);
    const env7 = lastNDescToAsc(envD, 7);
    const reserves7 = lastNDescToAsc(resD, 7);

    // Metrics (pick what you actually have in tables)
    const todayCons = safeNum(consD?.[0]?.Total_Consumption);
    const todayProd = safeNum(prodD?.[0]?.Total_Production);

    const solarTodayGenerated = safeNum(solD?.[0]?.Total_Energy_Generated);
    const solarTodayEff = safeNum(solD?.[0]?.Panel_Efficiency);

    const avgTemp7 = avg(env7, "Temperature");
    const avgHumidity7 = avg(env7, "Humidity");

    const net7 = cons7.map((r, i) => ({
      x: r?.Timestamp || r?.Date,
      y: safeNum(prod7?.[i]?.Total_Production) - safeNum(r?.Total_Consumption),
    }));

    return {
      // raw sets (expose if needed)
      consD, prodD, resD, envD, solD,
      consM, prodM, resM, solM,

      // for charts
      cons7, cons30, prod7, prod30, solar7, reserves7, net7,

      // headline numbers
      todayCons, todayProd,
      solarTodayGenerated, solarTodayEff,
      avgTemp7, avgHumidity7,

      // month-to-date using daily slices (good enough visually)
      mtdCons: sum(cons30, "Total_Consumption"),
      mtdProd: sum(prod30, "Total_Production"),
    };
  }, [raw]);

  return { raw, ...computed, loading, err };
}
