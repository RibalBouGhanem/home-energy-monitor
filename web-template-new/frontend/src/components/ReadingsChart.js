import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// rows: array of objects from DB
// xKey: timestamp column name
// yKeys: one or more numeric columns
export default function ReadingsChart({ title, rows, xKey, yKeys }) {
  const data = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows
      .map((r) => {
        const x = r?.[xKey];
        if (!x) return null;
        const obj = { ...r, __x: new Date(x).getTime() };
        return obj;
      })
      .filter(Boolean)
      .sort((a, b) => a.__x - b.__x);
  }, [rows, xKey]);

  if (!data.length) return null;

  return (
    <div className="datatable">
      <h3>{title} (Chart)</h3>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="__x"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(v) => new Date(v).toLocaleString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
            />
            {yKeys.map((k) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
