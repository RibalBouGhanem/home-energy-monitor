import React from "react";
import "../../styles/AdminPages.css";

export default function MonitorsList() {
  return (
    <section className="admin-page">
      <h2 className="section-title">Monitors</h2>
      <p className="admin-muted">
        This page will show monitors (serial, assigned house, last seen, status).
      </p>
    </section>
  );
}
