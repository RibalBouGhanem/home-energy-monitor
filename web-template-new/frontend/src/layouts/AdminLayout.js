import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Navbar />
      <main className="admin-main">
        <div className="dashboard-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
