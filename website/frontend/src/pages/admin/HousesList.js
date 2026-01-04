import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import SearchableSelect from "../../components/SearchableSelect";
import "../../styles/AdminPages.css";
import "../../styles/HousesList.css";

export default function HousesList() {
  const [monitors, setMonitors] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // filters
  const [fOwnerEmail, setFOwnerEmail] = useState("");
  const [fLocation, setFLocation] = useState("");
  const [fStatus, setFStatus] = useState("");

  const normalize = (v) => (v ?? "").toString().toLowerCase();
  const getMonitorId = (m) => (m.Monitor_ID ?? "").toString();
  const getOwner = (m) => (m.User_Email ?? "").toString();
  const getLocation = (m) => (m.Location ?? "").toString();
  const getStatus = (m) => (m.Status ?? "").toString();

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/api/monitors");
      setMonitors(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("HOUSES LOAD ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load houses (from monitors).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const monitorOptions = useMemo(() => monitors.map((m) => getOwner(m)).filter(Boolean), [monitors]);
  const locationOptions = useMemo(() => ["Abu Dhabi", "Ajman", "Al Ain", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah"], []);
  const statusOptions = useMemo(() => ["Online", "Offline", "Maintenance"], []);

  const filtered = useMemo(() => {
    const contains = (cell, typed) => normalize(cell).includes(normalize(typed).trim());
    const getEmirateFromLocation = (loc) => {
      const s = (loc ?? "").toString();
      return normalize(s.split(/[-]/)[0]).trim();
    };

    return monitors.filter((m) => {
      if (fOwnerEmail && !contains(getOwner(m), fOwnerEmail)) return false;
      if (fLocation) {
        const emirate = getEmirateFromLocation(getLocation(m));
        const q = normalize(fLocation).trim();     // what user typed or selected
        if (q && !(emirate.startsWith(q) || contains(getLocation(m), fLocation))) return false;
      }
      if (fStatus && !contains(getStatus(m), fStatus)) return false;
      return true;
    });
  }, [monitors, fOwnerEmail, fLocation, fStatus]);

  const clearFilters = () => {
    setFOwnerEmail("");
    setFLocation("");
    setFStatus("");
  };

  return (
    <section className="admin-page houses-page">
      <div className="admin-page-header">
        <h2 className="section-title">Houses</h2>

        <div className="houses-actions">
          <button type="button" className="secondary-button" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      <div className="houses-filters">
        <SearchableSelect
          label="Owner Email"
          value={fOwnerEmail}
          onChange={setFOwnerEmail}
          options={monitorOptions}
        />
        <SearchableSelect
          label="Location"
          value={fLocation}
          onChange={setFLocation}
          options={locationOptions}
        />
        <SearchableSelect
          label="Has Status"
          value={fStatus}
          onChange={setFStatus}
          options={statusOptions}
          searchable={false}
        />
        <button type="button" className="secondary-button houses-clear" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {err && <div className="admin-error">{err}</div>}

      <div className="admin-table">
        <table className="admin-table-table">
          <thead>
            <tr>
              <th>Owner Email</th>
              <th>Location</th>
              <th>Status</th>
              <th>Monitor ID</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="houses-empty">Loading houses...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="houses-empty">No houses found.</td>
              </tr>
            ) : (
              filtered.map((m) => {
                const owner = getOwner(m);
                const location = getLocation(m);
                const status = getStatus(m);
                const monitorId = getMonitorId(m);

                return (
                  <tr key={`${owner}-${location}-${monitorId}`}>
                    <td>{owner || "—"}</td>
                    <td>{location || "—"}</td>
                    <td>{status || "—"}</td>
                    <td>{monitorId || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
