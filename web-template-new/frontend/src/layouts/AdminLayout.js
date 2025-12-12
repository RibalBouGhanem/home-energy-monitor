import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/AdminLayout.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside style={{ padding: 18, borderRight: "1px solid rgba(148,163,184,0.35)" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700 }}>Admin Panel</div>
          <div style={{ opacity: 0.8, fontSize: 13 }}>{user?.email}</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AdminLink to="/admin">Dashboard</AdminLink>
          <AdminLink to="/admin/users">Users</AdminLink>
          <AdminLink to="/admin/houses">Houses</AdminLink>
          <AdminLink to="/admin/monitors">Monitors</AdminLink>
          <AdminLink to="/admin/readings">Data Explorer</AdminLink>
        </nav>

        <button
          onClick={logout}
          style={{ marginTop: 18, width: "100%", padding: "10px 12px", borderRadius: 999 }}
        >
          Log out
        </button>
      </aside>

      <main style={{ padding: 22 }}>
        <Outlet />
      </main>
    </div>
  );
}

function AdminLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      style={({ isActive }) => ({
        padding: "10px 12px",
        borderRadius: 12,
        textDecoration: "none",
        color: "inherit",
        background: isActive ? "rgba(56,189,248,0.18)" : "transparent",
        border: "1px solid rgba(148,163,184,0.25)",
      })}
    >
      {children}
    </NavLink>
  );
}
