import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "../../components/SearchableSelect";

import "../../styles/AdminPages.css";
import "../../styles/MonitorsList.css";

export default function MonitorsList() {
  const navigate = useNavigate();
  const sortOptions = [
    { value: "asc", label: "Monitor ID ↑" },
    { value: "desc", label: "Monitor ID ↓" },
  ];

  const [monitors, setMonitors] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // DELETE modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // EDIT modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStatus, setEditStatus] = useState("offline");
  const [editMicro, setEditMicro] = useState("");
  const [editInstallDate, setEditInstallDate] = useState("");
  const [saving, setSaving] = useState(false);

  // ====== Helpers (FIXES YOUR no-undef ERRORS) ======
  const normalize = (v) => (v ?? "").toString().toLowerCase();

  const getMonitorId = (m) => (m.Monitor_ID ?? m.monitorId ?? m.id ?? "").toString();
  const getUserEmail = (m) => (m.User_Email ?? m.userEmail ?? m.email ?? "").toString();
  const getLocation = (m) => (m.Location ?? m.location ?? "").toString();
  const getStatus = (m) => (m.Status ?? m.status ?? "").toString();
  const getMicro = (m) => (m.Microprocessor_Type ?? m.microprocessorType ?? "").toString();
  const getInstall = (m) => {
    const raw = m.Installation_Date ?? m.installationDate ?? "";
    const s = (raw ?? "").toString();
    return s.includes("T") ? s.split("T")[0] : s.slice(0, 10);
  };

  // ====== Column filters (searchable selects) ======
  const [sortDir, setSortDir] = useState("asc");
  const [fEmail, setFEmail] = useState("");
  const [fLocation, setFLocation] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fMicro, setFMicro] = useState("");
  const [fInstall, setFInstall] = useState("");

  const loadMonitors = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/api/monitors");
      setMonitors(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("LOAD MONITORS ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load monitors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitors();
  }, []);

  // Build dropdown options per column
  const emailOptions = useMemo(() => monitors.map(getUserEmail).filter(Boolean), [monitors]);
  const locationOptions = useMemo(() => monitors.map(getLocation).filter(Boolean), [monitors]);
  const statusOptions = useMemo(() => monitors.map(getStatus).filter(Boolean), [monitors]);
  const microOptions = useMemo(() => monitors.map(getMicro).filter(Boolean), [monitors]);
  const installOptions = useMemo(() => monitors.map(getInstall).filter(Boolean), [monitors]);

  // Actual row filtering: each filter only affects its own column
  const filtered = useMemo(() => {
  const contains = (cell, typed) => normalize(cell).includes(normalize(typed).trim());

  const rows = monitors.filter((m) => {
    if (fEmail && !contains(getUserEmail(m), fEmail)) return false;
    if (fLocation && !contains(getLocation(m), fLocation)) return false;
    if (fStatus && !contains(getStatus(m), fStatus)) return false;
    if (fMicro && !contains(getMicro(m), fMicro)) return false;
    if (fInstall && !contains(getInstall(m), fInstall)) return false;
    return true;
  });

  // sort by numeric monitor id if possible, else string compare fallback
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  rows.sort((a, b) => {
    const aId = getMonitorId(a);
    const bId = getMonitorId(b);

    const aN = toNum(aId);
    const bN = toNum(bId);

    let cmp = 0;
    if (aN !== null && bN !== null) cmp = aN - bN;
    else cmp = aId.localeCompare(bId);

    return sortDir === "asc" ? cmp : -cmp;
  });

  return rows;
}, [monitors, fEmail, fLocation, fStatus, fMicro, fInstall, sortDir]);


  const clearFilters = () => {
    setFEmail("");
    setFLocation("");
    setFStatus("");
    setFMicro("");
    setFInstall("");
  };

  // ====== Actions ======
  const goToReadings = (id) => {
    navigate(`/admin/readings?monitorId=${encodeURIComponent(id)}`);
  };

  const openEdit = (m) => {
    setErr("");
    setEditId(getMonitorId(m));
    setEditUserEmail(getUserEmail(m));
    setEditLocation(getLocation(m));
    setEditStatus(getStatus(m) || "offline");
    setEditMicro(getMicro(m));
    setEditInstallDate(getInstall(m));
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSaving(false);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;

    try {
      setSaving(true);
      setErr("");

      const payload = {
        User_Email: editUserEmail.trim(),
        Location: editLocation.trim(),
        Status: editStatus,
        Microprocessor_Type: editMicro.trim(),
        Installation_Date: editInstallDate || null,
      };

      const res = await api.put(`/api/monitors/${encodeURIComponent(editId)}`, payload);

      const updated = res.data?.monitor
        ? res.data.monitor
        : { Monitor_ID: editId, ...payload };

      setMonitors((prev) => prev.map((m) => (getMonitorId(m) === editId ? { ...m, ...updated } : m)));
      closeEdit();
    } catch (e2) {
      console.log("SAVE MONITOR ERROR:", e2);
      setErr(e2?.response?.data?.message || "Failed to update monitor.");
      setSaving(false);
    }
  };

  const deleteMonitor = async (id) => {
    try {
      setErr("");
      await api.delete(`/api/monitors/${encodeURIComponent(id)}`);
      setMonitors((prev) => prev.filter((m) => getMonitorId(m) !== id));
      setConfirmDeleteId(null);
    } catch (e) {
      console.log("DELETE MONITOR ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to delete monitor.");
    }
  };

  return (
    <section className="admin-page monitors-page">
      <div className="admin-page-header">
        <h2 className="section-title">Monitors</h2>

        <div className="monitors-actions">
          <button type="button" className="secondary-button" onClick={loadMonitors}>
            Refresh
          </button>
        </div>
      </div>

      {/* Per-column filters */}
      <div className="monitors-filters">
        <SearchableSelect
          label="Sort"
          value={sortOptions.label || sortOptions[0].label}
          onChange={setSortDir}
          options={sortOptions}
          allowAll={false}
          searchable={false}
          placeholder="Select..."
        />
        <SearchableSelect label="Owner Email" value={fEmail} onChange={setFEmail} options={emailOptions} />
        <SearchableSelect label="Location" value={fLocation} onChange={setFLocation} options={locationOptions} />
        <SearchableSelect label="Status" value={fStatus} onChange={setFStatus} options={statusOptions} />
        <SearchableSelect label="Microprocessor" value={fMicro} onChange={setFMicro} options={microOptions} />
        <SearchableSelect label="Installed" value={fInstall} onChange={setFInstall} options={installOptions} />

        <button type="button" className="secondary-button monitors-clear" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {err && <div className="admin-error">{err}</div>}

      <div className="admin-table">
        <table className="admin-table-table">
          <thead>
            <tr>
              <th>Monitor ID</th>
              <th>Owner Email</th>
              <th>Location</th>
              <th>Status</th>
              <th>Microprocessor</th>
              <th>Installed</th>
              <th className="monitors-col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="monitors-empty">Loading monitors...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="monitors-empty">No monitors found.</td>
              </tr>
            ) : (
              filtered.map((m) => {
                const id = getMonitorId(m);
                return (
                  <tr key={id || `${getUserEmail(m)}-${getLocation(m)}`}>
                    <td>{id || "—"}</td>
                    <td>{getUserEmail(m) || "—"}</td>
                    <td>{getLocation(m) || "—"}</td>
                    <td>{getStatus(m) || "—"}</td>
                    <td>{getMicro(m) || "—"}</td>
                    <td>{getInstall(m) || "—"}</td>

                    <td className="monitors-actions-cell">
                      <button type="button" className="secondary-button" onClick={() => goToReadings(id)} disabled={!id}>
                        Readings
                      </button>
                      <button type="button" className="secondary-button" onClick={() => openEdit(m)}>
                        Edit
                      </button>
                      <button type="button" className="danger-button" onClick={() => setConfirmDeleteId(id)} disabled={!id}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="modal-backdrop modal-fade" role="dialog" aria-modal="true" onMouseDown={closeEdit}>
          <div className="modal modal-pop" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Monitor</h3>
            <p className="modal-text">Update monitor/building information.</p>

            <form className="login-form" onSubmit={saveEdit}>
              <div className="form-group">
                <label htmlFor="edit-monitor-id">Monitor ID</label>
                <input id="edit-monitor-id" value={editId} disabled readOnly />
              </div>

              <div className="form-group">
                <label htmlFor="edit-owner-email">Owner Email</label>
                <input
                  id="edit-owner-email"
                  type="text"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-location">Location</label>
                <input
                  id="edit-location"
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">Status</label>
                <select id="edit-status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-micro">Microprocessor Type</label>
                <input id="edit-micro" type="text" value={editMicro} onChange={(e) => setEditMicro(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="edit-install-date">Installation Date</label>
                <input id="edit-install-date" type="date" value={editInstallDate} onChange={(e) => setEditInstallDate(e.target.value)} />
              </div>

              <div className="modal-actions">
                <button type="submit" className="cta-button" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" className="secondary-button" onClick={closeEdit} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {confirmDeleteId && (
        <div className="modal-backdrop modal-fade" role="dialog" aria-modal="true" onMouseDown={() => setConfirmDeleteId(null)}>
          <div className="modal modal-pop" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete monitor?</h3>
            <p className="modal-text">
              Are you sure you want to delete monitor <b>{confirmDeleteId}</b>?<br />
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button type="button" className="danger-button" onClick={() => deleteMonitor(confirmDeleteId)}>
                Yes, delete
              </button>
              <button type="button" className="secondary-button" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
