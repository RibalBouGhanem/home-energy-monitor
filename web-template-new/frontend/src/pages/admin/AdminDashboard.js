import React from "react";
import "../../styles/AdminPages.css";

export default function AdminDashboard() {
  return (
    <section className="admin-page">
      <h2 className="section-title">Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">👥</div>
            <div className="stat-title">Users</div>
          </div>
          <div className="stat-value">—</div>
          <div className="stat-description">Manage customer accounts and permissions.</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">🏠</div>
            <div className="stat-title">Houses</div>
          </div>
          <div className="stat-value">—</div>
          <div className="stat-description">View subscribed houses and service status.</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">📟</div>
            <div className="stat-title">Monitors</div>
          </div>
          <div className="stat-value">—</div>
          <div className="stat-description">Track energy monitors, health, and last seen.</div>
        </div>
      </div>
    </section>
  );
}
