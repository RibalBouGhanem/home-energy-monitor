import React from "react";

export default function ChartCard({ title, children }) {
  return (
    <div className="datatable">
      <h3>{title}</h3>
      <div style={{ width: "100%", height: 320 }}>
        {children}
      </div>
    </div>
  );
}
