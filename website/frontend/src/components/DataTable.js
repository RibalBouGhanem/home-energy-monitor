import React, { useState, useEffect, useMemo } from "react";

export default function DataTable({
  title,
  rows = [],
  onRowHover,
  onRowLeave,
  highlightRow,
  pageSize = 8,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const totalPages = Math.max(1, Math.ceil(safeRows.length / pageSize));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [safeRows, pageSize]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return safeRows.slice(start, start + pageSize);
  }, [safeRows, page, pageSize]);

  
  const canPrev = page > 1;
  const canNext = page < totalPages;
  
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  
  function getColumnLabel(col) {
    return col
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatCell(col, value) {
    if (value == null) return "-";

    if (col.toLowerCase().includes("efficiency") || col.toLowerCase().includes("humidity")) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (col.toLowerCase().includes("power") || col.toLowerCase().includes("value")) {
      return `${value} W`;
    }
    if (col.toLowerCase().includes("total") || col.toLowerCase().includes("reserve") || col.toLowerCase().includes("production")) {
      return `${value} Wh`;
    }
    if (col.toLowerCase().includes("light")) {
      return `${value} Lux`;
    }
    if (col.toLowerCase().includes("temperature")) {
      return `${value}°C`;
    }

    return value;
  }

  if (safeRows.length === 0) {
    return (
      <>
        <h3 style={{ marginBottom: 12 }}>{title}</h3>
        <div className="admin-table" style={{ padding: 12, opacity: 0.8 }}>
          No rows found.
        </div>
      </>
    );
  }

  const cols = Object.keys(safeRows[0]);

  return (
    <>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      <div style={{ overflowX: "auto" }} className="admin-table">
        <table className="admin-table-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{getColumnLabel(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => {
              const isHighlighted = highlightRow?.(r);
              const absoluteIndex = (page - 1) * pageSize + i;
              return (
                <tr
                  key={`${r.Monitor_ID ?? i}-${r.Date ?? i}`}  // better key
                  onMouseEnter={() => onRowHover?.(r, absoluteIndex)}
                  onMouseLeave={() => onRowLeave?.()}
                  style={isHighlighted ? { background: "rgba(255,255,255,0.06)" } : undefined}
                >
                  {cols.map((c) => (
                    <td key={c}>{formatCell(c, r[c]) ?? "-"}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="datatable-footer">
          {safeRows.length > pageSize && (
            <button
              type="button"
              className="secondary-button datatable-arrow"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous page"
            >
              ←
            </button>
          )}

          <div className="datatable-page">
            Page <strong>{page}</strong> / <span>{totalPages}</span>
          </div>

          {safeRows.length > pageSize && (
            <button
              type="button"
              className="secondary-button datatable-arrow"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next page"
            >
              →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
