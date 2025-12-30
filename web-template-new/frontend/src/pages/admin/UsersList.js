import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import "../../styles/AdminPages.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editOriginalEmail, setEditOriginalEmail] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editMonitorType, setEditMonitorType] = useState("");
  const [editSubscriptionType, setEditSubscriptionType] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(null);

    useEffect(() => {
      api
        .get("/api/accounts")
        .then((res) => setUsers(res.data))
        .catch(() => setErr("Failed to load users."));
    }, []);

    useEffect(() => {
      if (!confirmEmail) return;

      const onKeyDown = (e) => {
        if (e.key === "Escape") setConfirmEmail(null);
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [confirmEmail]);

    const openEdit = (u) => {
      setErr("");
      setEditOriginalEmail(u.email);
      setEditEmail(u.email);
      setEditName(u.name);
      setEditPhoneNumber(u.phoneNumber);
      setEditMonitorType(u.monitorType);
      setEditSubscriptionType(u.subscriptionType);
      setIsEditOpen(true);
    };

    const closeEdit = () => {
      setIsEditOpen(false);
      setEditOriginalEmail("");
      setEditEmail("");
      setEditName("");
      setEditPhoneNumber("");
      setEditMonitorType("");
      setEditSubscriptionType(0);
    };

    const saveEdit = async (e) => {
      e.preventDefault();
      setErr("");
      setEditSaving(true);

      try {
        const payload = {
          name: editName,
          phoneNumber: editPhoneNumber,
          monitorType: editMonitorType,
          subscriptionType: editSubscriptionType,
        };

        const res = await api.put(
          `/api/accounts/${encodeURIComponent(editOriginalEmail)}`,
          payload
        );

        const updatedUser = res.data?.user ?? { email: editOriginalEmail, isAdmin: editName };

        closeEdit();
      } catch (err) {
        console.log("EDIT USER ERROR:", err);
        setErr(err.response?.data?.message || "Failed to update user.");
        setEditMonitorType(false);
      }
    };
    
  const deleteUser = async (email) => {
    try {
      await api.delete(`/api/accounts/${email}`);
      setConfirmEmail(null);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

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
                    <button type="button" className="secondary-button" onClick={() => openEdit(u)}>
                      Edit
                    </button>
                    <button className="danger-btn" onClick={() => setConfirmEmail(u.email)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {confirmEmail && (
            <div
              className="modal-backdrop modal-fade"
              role="dialog"
              aria-modal="true"
              onMouseDown={() => setConfirmEmail(null)} // click backdrop closes
            >
              <div
                className="modal modal-pop"
                onMouseDown={(e) => e.stopPropagation()} // prevent closing when clicking inside
              >
                <h3 className="modal-title">Delete user?</h3>
                <p className="modal-text">
                  Are you sure you want to delete <b>{confirmEmail}</b>?
                  <br />
                  This action cannot be undone.
                </p>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => deleteUser(confirmEmail)}
                  >
                    Yes, delete
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setConfirmEmail(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEditOpen && (
            <div className="modal-backdrop modal-fade" role="dialog" aria-modal="true"
                onMouseDown={closeEdit}>
              <div className="modal modal-pop" onMouseDown={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Edit User</h3>
                <p className="modal-text">Update user settings. Email cannot be changed.</p>

                <form className="login-form" onSubmit={saveEdit}>
                  <div className="form-group">
                    <label htmlFor="edit-email">Email</label>
                    <input
                      id="edit-email"
                      type="text"
                      name="email"
                      value={editEmail}
                      readOnly
                      disabled
                    />
                    <small className="field-hint">Email is locked for editing.</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-name">Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      name="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Leave blank to keep unchanged"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-phoneNumber">Phone Number</label>
                    <input
                      id="edit-phoneNumber"
                      type="text"
                      name="phoneNumber"
                      value={editPhoneNumber}
                      onChange={(e) => setEditPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-monitorType">Monitor Type</label>
                    <input
                      id="edit-monitorType"
                      type="text"
                      name="monitorType"
                      value={editMonitorType}
                      onChange={(e) => setEditMonitorType(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-subscriptionType">Subscription Type</label>
                    <input
                      id="edit-subscriptionType"
                      type="text"
                      name="subscriptionType"
                      value={editSubscriptionType}
                      onChange={(e) => setEditSubscriptionType(e.target.value)}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="cta-button" disabled={editSaving}>
                      {editSaving ? "Saving..." : "Save changes"}
                    </button>

                    <button type="button" className="secondary-button" onClick={closeEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
