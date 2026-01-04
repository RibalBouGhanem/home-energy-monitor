import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = user?.isAdmin
    ? [
        { to: "/admin/users", label: "Users" },
        { to: "/admin/monitors", label: "Monitors" },
        { to: "/admin/houses", label: "Houses" },
        { to: "/admin/readings", label: "Readings" },
        { to: "/admin/system-logs", label: "System Logs" },
      ]
    : [
        { to: "/home", label: "Home", end: true },
        { to: "/analytics", label: "Analytics" },
        { to: "/reports", label: "Reports" },
        { to: "/contact", label: "Contact" },
      ];

  return (
    <nav id="navbar" className={user?.isAdmin ? "navbar-admin" : ""}>
      <div className="nav-container">
        <NavLink to={user?.isAdmin ? "/admin" : "/"} className="logo" onClick={() => setOpen(false)}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 13h2v8H3zm4-8h2v13H7zm4-2h2v15h-2zm4 4h2v11h-2zm4-2h2v13h-2z" />
            </svg>
          </div>
          <span className="logo-text">Graph Page</span>
        </NavLink>

        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          {!user ? (
            <NavLink className="nav-auth-link" to="/login">
              Log in
            </NavLink>
          ) : (
            <button type="button" className="nav-auth-link nav-auth-button" onClick={handleLogout}>
              Log out
            </button>
          )}

          <button
            type="button"
            className={`hamburger ${open ? "is-open" : ""}`}
            id="hamburger"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <ul className={`nav-links-mobile ${open ? "open" : ""}`} id="navLinksMobile">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
