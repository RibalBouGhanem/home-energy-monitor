import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import "../../styles/AdminPages.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  // const deleteUser = async (email) => {
  //   try {
  //     await api.delete(`https://localhost:5000/api/users/${email}`);
  //     window.location.reload();
  //   } catch (err) {
  //     console.error("Error deleting user:", err);
  //   }
  // }

  useEffect(() => {
    api
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
        <div className="admin-table-scroll">
          <table className="admin-table-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Monitor Type</th>
                <th>Subscription Type</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, idx) => (
                <tr key={idx}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td>{u.monitorType}</td>
                  <td>{u.subscriptionType}</td>
                  <td className="td-actions">
                    {/* <button className="danger-btn" onClick={() => deleteUser(u.email)}>Delete</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
