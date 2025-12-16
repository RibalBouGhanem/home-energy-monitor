import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../styles/AdminPages.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    axios
      .get("/api/users")
      .then((res) => setUsers(res.data))
      .catch(() => setErr("Failed to load users."));
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h2 className="section-title">Users</h2>
        <Link className="cta-button" to="/admin/users/new">
          Create User
        </Link>
      </div>

      {err && <p className="form-error">{err}</p>}

      <div className="admin-table">
        <div className="admin-table-row admin-table-head">
          <div>Email</div>
          <div>Admin</div>
        </div>

        {users.map((u, idx) => (
          <div key={idx} className="admin-table-row">
            <div>{u.email}</div>
            <div>{u.isAdmin ? "Yes" : "No"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
