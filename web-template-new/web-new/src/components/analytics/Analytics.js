// src/components/analytics/Analytics.jsx
import React, { useState } from "react";
import MetricsGrid from "./MetricsGrid";
import MonthlyTrendsChart from "./charts/MonthlyTrendsChart";
import GrowthAnalyticsChart from "./charts/GrowthAnalyticsChart";
import GeoDistributionChart from "./charts/GeoDistributionChart";
import DeviceAnalyticsChart from "./charts/DeviceAnalyticsChart";

export default function Analytics() {
  const [yearTab, setYearTab] = useState("2024");
  const [growthTab, setGrowthTab] = useState("Week");
  const [geoTab, setGeoTab] = useState("Global");
  const [deviceTab, setDeviceTab] = useState("This Month");

  return (
    <section className="analytics-section" id="analytics">
      <div className="dashboard-container">
        <h2 className="section-title">Advanced Analytics</h2>

        <MetricsGrid />

        <div className="charts-grid">
          <MonthlyTrendsChart
            activeYear={yearTab}
            onChangeYear={setYearTab}
          />
          <GrowthAnalyticsChart
            activeRange={growthTab}
            onChangeRange={setGrowthTab}
          />
          <GeoDistributionChart
            activeRegion={geoTab}
            onChangeRegion={setGeoTab}
          />
          <DeviceAnalyticsChart
            activePeriod={deviceTab}
            onChangePeriod={setDeviceTab}
          />
        </div>
      </div>
    </section>
  );
}
