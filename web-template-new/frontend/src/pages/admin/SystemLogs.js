import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/AdminPages.css";
import "../../styles/SystemLogs.css";

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  const fetchLogs = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/api/system-logs");
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("SYSTEM LOGS FETCH ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load system logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // If you want auto-refresh, uncomment:
    // const t = setInterval(fetchLogs, 5000);
    // return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const e = emailFilter.trim().toLowerCase();

    let list = logs;

    if (e) {
      list = list.filter((row) => (row.User_Email).toLowerCase().includes(e));
    }

    if (s) {
      list = list.filter((row) => {
        const details = (row.Details).toLowerCase();
        const email = (row.User_Email).toLowerCase();
        const dt = (row.Datetime).toLowerCase();
        const id = String(row.Log_ID).toLowerCase();
        return details.includes(s) || email.includes(s) || dt.includes(s) || id.includes(s);
      });
    }

    // show newest first, but your backend already orders DESC
    return list
  }, [logs, search, emailFilter]);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h2 className="section-title">System Logs</h2>

        <div className="logs-controls">
          <input
            className="logs-input"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Filter by User Email"
          />
          <input
            className="logs-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search (Details, Email, Datetime, ID)"
          />

          <button className="cta-button" onClick={fetchLogs} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {err && <p className="error-message">{err}</p>}

      {loading ? (
        <p className="loading-text">Loading logs...</p>
      ) : (
        <div className="admin-table-">
          <table className="admin-table-table">
            <thead>
              <tr>
                <th>Log_ID</th>
                <th>User_Email</th>
                <th>Details</th>
                <th>Datetime</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", opacity: 0.8 }}>
                    No logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.Log_ID}>
                    <td>{row.Log_ID}</td>
                    <td>{row.User_Email}</td>
                    <td className="logs-details-cell">
                      <pre className="logs-details">{row.Details}</pre>
                    </td>
                    <td>{row.Datetime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p className="logs-footnote">
            Read-only view. No delete/edit actions are available.
          </p>
        </div>
      )}
    </section>
  );
}
