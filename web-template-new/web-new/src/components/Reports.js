// src/components/Reports.jsx
import React from "react";

export default function Reports() {
	return (
		<section className="reports-section" id="reports">
			<div className="dashboard-container">
				<h2 className="section-title">Reports &amp; Insights</h2>
				<div className="info-grid">
					<div className="info-card">
						<div className="info-icon">💼</div>
						<h3 className="info-title">Business Intelligence</h3>
						<div className="info-value">98.5%</div>
						<p style={{ fontSize: 14, color: "#a0a0a0" }}>
							Accuracy in predictive analytics and business forecasting models.
						</p>
					</div>
					<div className="info-card">
						<div className="info-icon">📱</div>
						<h3 className="info-title">Mobile Analytics</h3>
						<div className="info-value">2.4M</div>
						<p style={{ fontSize: 14, color: "#a0a0a0" }}>
							Mobile app downloads and active user engagement metrics.
						</p>
					</div>
					<div className="info-card">
						<div className="info-icon">🌍</div>
						<h3 className="info-title">Global Reach</h3>
						<div className="info-value">150+</div>
						<p style={{ fontSize: 14, color: "#a0a0a0" }}>
							Countries actively using our analytics platform worldwide.
						</p>
					</div>
					<div className="info-card">
						<div className="info-icon">🚀</div>
						<h3 className="info-title">Performance Index</h3>
						<div className="info-value">847</div>
						<p style={{ fontSize: 14, color: "#a0a0a0" }}>
							Comprehensive performance scoring across all platform metrics.
						</p>
					</div>
					<div className="info-card">
						<div className="info-icon">⚡</div>
						<h3 className="info-title">Response Time</h3>
						<div className="info-value">0.2s</div>
						<p style={{ fontSize: 14, color: "#a0a0a0" }}>
							Average API response time ensuring optimal user experience.
						</p>
					</div>
					<div className="info-card">
						<div className="info-icon">📊</div>
						<h3 className="info-title">Data Processing</h3>
						<div className="info-value">12TB</div>
						<p style={{ fontSize: 14, color: "#a0a0a0" }}>
							Daily data volume processed through our analytics pipeline.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
