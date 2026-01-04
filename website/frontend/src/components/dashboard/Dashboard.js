// src/components/dashboard/Dashboard.jsx
import React, { useMemo } from "react";
import StatCard from "./StatCard";
import { useDashboardStats } from "../analytics/hooks/useDashboardStats";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  // Read monitors from localStorage
  const monitors = useMemo(() => {
    return safeParse(localStorage.getItem("monitors"), []);
  }, []);

  // Derive monitorId (no storing/persisting; just using what's already in localStorage)
  const selectedMonitorId = useMemo(() => {
    const first = monitors?.[0];
    const id = first?.Monitor_ID ?? first?.monitor_id;
    return id != null ? String(id) : "";
  }, [monitors]);

  const { stats, err, loading } = useDashboardStats(selectedMonitorId);

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="dashboard-container">
        <h2 className="section-title">Dashboard Overview</h2>

        {!selectedMonitorId && (
          <div className="muted" style={{ marginTop: 10 }}>
            No monitor found for this account. (Try logging in again.)
          </div>
        )}

        {loading && selectedMonitorId && (
          <div className="muted" style={{ marginTop: 10 }}>
            Loading dashboard stats...
          </div>
        )}

        {err && (
          <div className="error" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}

        <div className="stats-grid" style={{ marginTop: 16 }}>
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
