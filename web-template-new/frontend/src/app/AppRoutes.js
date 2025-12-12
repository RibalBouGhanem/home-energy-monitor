import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersList from "../pages/admin/UsersList";
import UserCreate from "../pages/admin/UserCreate";
// import UserDetail from "../pages/admin/UserDetail";
// import HousesList from "../pages/admin/HousesList";
// import MonitorsList from "../pages/admin/MonitorsList";
// import MonitorDetail from "../pages/admin/MonitorDetail";
// import ReadingsExplorer from "../pages/admin/ReadingsExplorer";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Anything behind auth */}
      <Route element={<RequireAuth />}>
        {/* Admin-only area */}
        <Route element={<RequireRole />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/new" element={<UserCreate />} />
            {/* <Route path="users/:id" element={<UserDetail />} />

            <Route path="houses" element={<HousesList />} />

            <Route path="monitors" element={<MonitorsList />} />
            <Route path="monitors/:id" element={<MonitorDetail />} />

            <Route path="readings" element={<ReadingsExplorer />} /> */}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );
}
