import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../styles/UsersList.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/api/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Users</h1>
        <Link to="/admin/users/new">Create User</Link>
      </div>

      <ul className="users-list">
        {users.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong> — {u.email} ({u.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
