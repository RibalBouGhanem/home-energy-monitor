import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function UserLayout() {
  return (
    <div className="user-shell">
      <Navbar />
      <main className="user-main">
        <div className="dashboard-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
