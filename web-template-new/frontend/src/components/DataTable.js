import React from "react";

export default function DataTable({
  title,
  rows = [],
  onRowHover,
  onRowLeave,
  highlightRow,
  scrollToHighlighted
}) {
  if (!rows || rows.length === 0) return null;

  const cols = Object.keys(rows[0]);

  return (
    <>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      <div style={{ overflowX: "auto" }} className="admin-table">
        <table className="admin-table-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isHighlighted = highlightRow?.(r);

              return (
                <tr
                  key={i}
                  onMouseEnter={() => onRowHover?.(r, i)}
                  onMouseLeave={() => onRowLeave?.()}
                  ref={(el) => {
                    if (scrollToHighlighted && isHighlighted && el) {
                      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    }
                  }}
                  style={
                    isHighlighted
                      ? { background: "rgba(255,255,255,0.06)" }
                      : undefined
                  }
                >
                  {cols.map((c) => (
                    <td key={c}>{r[c] ?? "-"}</td>
                  ))}
                </tr>
              );
            })}

          </tbody>
        </table>
      </div>
    </>
  );
}
