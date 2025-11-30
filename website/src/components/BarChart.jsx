import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function BarChart() {
  const labels = ["", "", "", "", "", ""]; // empties keep UI clean
  const data = {
    labels,
    datasets: [
      {
        label: "Appliance",
        data: [0.5, 0.3, 0.7, 0.45, 0.6, 0.55],
        borderRadius: 6,
        backgroundColor: (context) => {
          // highlight the middle bar
          const idx = context.dataIndex;
          return idx === 2 ? "rgba(88,166,255,0.95)" : "rgba(88,166,255,0.25)";
        },
        barThickness: 26,
      },
    ],
  };

  const options = {
    indexAxis: "x",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: 240 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
