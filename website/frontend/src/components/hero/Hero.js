import React from "react";
import Shapes from "./shapes"
import Buildings from "./buildings"
import StatCard from "../dashboard/StatCard";

const STATS = [
  {
    icon: "📊",
    title: "Total Revenue",
    value: "$42,847",
    description:
      "Monthly revenue increased by 23% compared to last month with strong performance across all channels.",
    chartId: "miniChart1",
    color: "#00ffcc",
  },
  {
    icon: "👥",
    title: "Active Users",
    value: "18.5K",
    description:
      "Real-time analytics showing active users currently engaging with the platform.",
    chartId: "miniChart2",
    color: "#ff0080",
  },
  {
    icon: "🎯",
    title: "Conversion Rate",
    value: "94.3%",
    description:
      "Customer satisfaction rate based on recent surveys and feedback analysis.",
    chartId: "miniChart3",
    color: "#00ccff",
  },
  {
    icon: "🚀",
    title: "Performance Score",
    value: "7,392",
    description:
      "Overall system performance metrics showing optimal operation across all services.",
    chartId: "miniChart4",
    color: "#ffcc00",
  },
  {
    icon: "💰",
    title: "Monthly Growth",
    value: "+28.5%",
    description:
      "Consistent month-over-month growth in user acquisition and revenue generation.",
    chartId: "miniChart5",
    color: "#ff6b6b",
  },
  {
    icon: "⚡",
    title: "System Uptime",
    value: "99.9%",
    description:
      "Exceptional reliability with minimal downtime ensuring seamless user experience.",
    chartId: "miniChart6",
    color: "#4ecdc4",
  },
];

export default function Hero() {
	return (
		<section className="hero" id="home">
			<div className="hero-bg"></div>
			<Shapes/>

			<div className="hero-content">
				<div className="hero-text">
					<h1>
						Your Energy Data
					</h1>
					<p>
						Welcome , your home's energy monitor has some data available to for you!
						Navigate to the page you'd like in order to check out more information on your home's energy!
					</p>
					<a href="#dashboard" className="cta-button">
						Get Started
					</a>
				</div>

				<Buildings/>
			</div>
			{/* <div className="dashboard-section" id="dashboard">
				<div className="dashboard-container">
				<h2 className="section-title">Dashboard Overview</h2>
				<div className="stats-grid">
					{STATS.map((stat) => (
					<StatCard key={stat.title} {...stat} />
					))}
				</div>
				</div>
			</div> */}
		</section>
	);
}
