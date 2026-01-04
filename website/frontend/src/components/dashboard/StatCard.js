// src/components/dashboard/StatCard.jsx
import React, { useEffect } from "react";
// import { drawMiniChart } from "../../utils/charts";

export default function StatCard({
	icon,
	title,
	value,
	description,
	chartId,
	color,
}) {
	// useEffect(() => {
	// 	if (!chartId || !color) return;
	// 	const timeout = setTimeout(() => {
	// 		drawMiniChart(chartId, color);
	// 	}, 100);
	// 	return () => clearTimeout(timeout);
	// }, [chartId, color]);

	return (
		<div className="stat-card">
			<div className="stat-header">
				<div className="stat-icon">{icon}</div>
				<div className="stat-title">{title}</div>
			</div>
			<div className="stat-value">{value}</div>
			<div className="stat-description">{description}</div>
			<div className="stat-chart">
				<canvas className="mini-chart" id={chartId} />
			</div>
		</div>
	);
}
