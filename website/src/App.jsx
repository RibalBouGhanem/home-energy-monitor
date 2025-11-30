import React, { useState } from "react";
import Gauge from "./components/Gauge";
import BarChart from "./components/BarChart";
import BottomNav from "./components/BottomNav";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("Today");

  return (
    <div className="app-container">
      <div className="app-shell">
        {/* Top navigation */}
        <header className="topbar">
          <div className="tabs">
            {["Now", "Today", "Week", "Month"].map((t) => (
              <button
                key={t}
                className={`tab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </header>
        {/* Main content panel */}
        <main className="main-grid">
          {/* Left column */}
          <section className="left-col">
            <div className="panel gauge-panel">
              <Gauge />
              <div className="gauge-caption">Home energy use</div>
            </div>
            <div className="panel small-panels">
              <div className="mini-card">
                <div className="mini-title">Solar</div>
                <div className="mini-gauge" />
              </div>
              <div className="mini-card">
                <div className="mini-title">Grid</div>
                <div className="mini-gauge" />
              </div>
            </div>
          </section>
          {/* Right column */}
          <section className="right-col">
            <div className="panel chart-panel">
              <div className="chart-header">Thu, 30 Feb 2023, 9 AM - 10 AM</div>
              <BarChart />
            </div>
            <div className="panel appliances-panel">
              <h3 className="panel-title">Appliances</h3>
              <div className="appliance-row">
                <div className="appliance-label">Plug consumption</div>
                <div className="appliance-bar">
                  <div className="appliance-bar-fill" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="appliance-row">
                <div className="appliance-label">Other</div>
                <div className="appliance-bar">
                  <div className="appliance-bar-fill" style={{ width: "30%", background: "rgba(88,166,255,0.18)" }} />
                </div>
              </div>
            </div>
          </section>
        </main>
        {/* Bottom nav */}
        <BottomNav />
      </div>
    </div>
  );
}
