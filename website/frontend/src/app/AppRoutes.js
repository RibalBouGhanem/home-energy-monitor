import React from "react";
import { Routes, Route } from "react-router-dom";
import "../styles/templatemo-graph-page.css";

import RequireRole from "../auth/RequireRole";

import LoginPage from "../pages/LoginPage";

import UserLayout from "../layouts/UserLayout";
import Hero from "../components/hero/Hero";
import Dashboard from "../components/dashboard/Dashboard";
import Analytics from "../components/analytics/Analytics";
import Reports from "../components/Reports";
import Contact from "../components/Contact";


import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersList from "../pages/admin/UsersList";
import UserCreate from "../pages/admin/UserCreate";
import HousesList from "../pages/admin/HousesList";
import MonitorsList from "../pages/admin/MonitorsList";
import ReadingsExplorer from "../pages/admin/ReadingsExplorer";
import SystemLogsPage from "../pages/admin/SystemLogs";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/*User area */}
      <Route element={<RequireRole userOnly />}>
          <Route element={<UserLayout />}>
          <Route path="/" element={<Hero />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Route>

      {/* Admin-only area */}
      <Route element={<RequireRole adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="users/new" element={<UserCreate />} />
          <Route path="houses" element={<HousesList />} />
          <Route path="monitors" element={<MonitorsList />} />
          <Route path="readings" element={<ReadingsExplorer />} />
          <Route path="system-logs" element={<SystemLogsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );
}
