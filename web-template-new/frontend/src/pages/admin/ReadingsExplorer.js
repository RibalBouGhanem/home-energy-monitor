import React, { useRef, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useLocation } from "react-router-dom";
import SearchableSelect from "../../components/SearchableSelect";
import DataTable from "../../components/DataTable";
import ChartCard from "../../components/charts/ChartCard";
import LineTimeChart from "../../components/charts/LineTimeChart";
import { exportRowsToCsv } from "../../utils/exportCsv";
import "../../styles/AdminPages.css";
import "../../styles/ReadingsExplorer.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ReadingsExplorer() {
  const qs = useQuery();
  
  const consumptionChartRef = useRef(null);
  const productionChartRef = useRef(null);
  const environmentalChartRef = useRef(null);
  const solarChartRef = useRef(null);

  const [monitors, setMonitors] = useState([]);
  const [err, setErr] = useState("");
  const [loadingMonitors, setLoadingMonitors] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [readingsData, setReadingsData] = useState(null);
  const [tablesChosen, setTablesChosen] = useState("All");

  const [monitorId, setMonitorId] = useState(qs.get("monitorId") || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [hoverConsumptionX, setHoverConsumptionX] = useState(null);
  const [hoverProductionX, setHoverProductionX] = useState(null);
  const [hoverEnvironmentalX, setHoverEnvironmentalX] = useState(null);
  const [hoverSolarX, setHoverSolarX] = useState(null);


  const getMonitorId = (m) => (m.Monitor_ID ?? "").toString();
  const monitorOptions = useMemo(() => monitors.map((m) => getMonitorId(m)).filter(Boolean), [monitors]);
  const tableOptions = useMemo(() => ["energy_consumption", "energy_production", "environmental_data", "solar_panel_data"], []);

  const consumptionIndexByTs = useMemo(() => {
    const map = new Map();
    (readingsData?.energy_consumption || []).forEach((r, i) => {
      if (r?.Timestamp) map.set(String(r.Timestamp), i);
    });
    return map;
  }, [readingsData]);

  const productionIndexByTs = useMemo(() => {
    const map = new Map();
    (readingsData?.energy_production || []).forEach((r, i) => {
      if (r?.Timestamp) map.set(String(r.Timestamp), i);
    });
    return map;
  }, [readingsData]);

  const environmentalIndexByTs = useMemo(() => {
    const map = new Map();
    (readingsData?.environmental_data || []).forEach((r, i) => {
      if (r?.Timestamp) map.set(String(r.Timestamp), i);
    });
    return map;
  }, [readingsData]);

  const solarIndexByTs = useMemo(() => {
    const map = new Map();
    (readingsData?.solar_panel_data || []).forEach((r, i) => {
      if (r?.Date_Calculated) map.set(String(r.Date_Calculated), i);
    });
    return map;
  }, [readingsData]);
  
  const consumptionYKeys = useMemo(() => ["Consumption_Value"], []);
  const productionYKeys = useMemo(() => ["Production_Value"], []);
  const envYKeys = useMemo(() => ["Temperature", "Humidity", "Light_Intensity"], []);
  const solarYKeys = useMemo(() => ["Theoretical_Panel_Production",	"Exact_Panel_Production", "Panel_Efficiency",	"Total_Energy_Generated"], []);
  
  const consumptionLabels = useMemo(() => ({Consumption_Value: "Consumption"}), []);
  const productionLabels = useMemo(() => ({ Production_Value: "Production" }), []);
  const envLabels = useMemo(() => ({
    Temperature: "Temperature",
    Humidity: "Humidity",
    Light_Intensity: "Light",
  }),[]);
  const solarLabels = useMemo(() => ({
    Theoretical_Panel_Production: "Theoretical Panel Production",
    Exact_Panel_Production: "Exact Panel Production",
    Panel_Efficiency: "Panel Efficiency",
    Total_Energy_Generated: "Total Energy Generated",
  }),[]);
    
  const lastLoaded = useMemo(() => {
    const loadTime = new Date().getTime();
    console.log("Readings data changed at", new Date(loadTime).toLocaleString());
    return loadTime;
  }, [readingsData]);

  const loadMonitors = async () => {
    try {
      setErr("");
      setLoadingMonitors(true);
      const res = await api.get("/api/monitors");
      setMonitors(res.data);
    } catch (e) {
      console.log("READINGS MONITORS ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load monitors.");
    } finally {
      setLoadingMonitors(false);
    }
  };

  const fetchMonitorReadings = async () => {
    if (!monitorId) {
      setErr("Please select a monitor.");
      return;
    }

    try {
      setErr("");
      setLoadingRows(true);

      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (Array.isArray(tablesChosen) && tablesChosen.length) params.set("tables", tablesChosen.join(","));

      const res = await api.get(`/api/monitor/${monitorId}/data?${params.toString()}`);
      
      // FRONTEND prune: keep only selected tables
      const selected = new Set(tablesChosen);
      const pruned = {};
      selected.forEach((k) => {
        pruned[k] = res.data?.[k] ?? [];
      });

      setReadingsData(pruned);
      console.log("SOLAR KEYS:", Object.keys(readingsData?.solar_panel_data?.[0] || {}));
      console.log("SOLAR yKeys:", solarYKeys);

    } catch (e) {
      console.log("FETCH MONITOR DATA ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load monitor data.");
      setReadingsData(null);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {loadMonitors();}, []);

  const highlightPoint = (chart, index) => {
    if (!chart || index == null) return;
    chart.setActiveElements([{ datasetIndex: 0, index }]);
    chart.tooltip.setActiveElements([{ datasetIndex: 0, index }], { x: 0, y: 0 });
    chart.update();
  };

  const clearHighlight = (chart) => {
    if (!chart) return;
    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update();
  };

  const toMs = (v) => {
    return new Date(v).getTime();
  };
  const toDate = (v) => {
    return new Date(v).getDate();
  }

  return (
    <section className="admin-page readings-page">
      <div className="admin-page-header">
        <h2 className="section-title">Readings Explorer</h2>

        {readingsData && <div className="last-loaded">Readings data last loaded on: {new Date(lastLoaded).toLocaleString()}</div>}
        <div className="readings-actions">
          <button
            type="button"
            className="cta-button"
            onClick={fetchMonitorReadings}
            disabled={loadingRows || loadingMonitors}
          >
            Load
          </button>
          {readingsData?.energy_consumption && 
            <button
              type="button"
              className="secondary-button"
              disabled={!readingsData}
              onClick={() => {
                const tables = [
                  ["monitors", readingsData.monitors],
                  ["energy_consumption", readingsData.energy_consumption],
                  ["energy_production", readingsData.energy_production],
                  ["environmental_data", readingsData.environmental_data],
                  ["energy_reserves", readingsData.energy_reserves],
                  ["notifications", readingsData.notifications],
                  ["sell_request", readingsData.sell_request],
                  ["solar_panel_data", readingsData.solar_panel_data],
                ];
                const prefix = `monitor_${monitorId}`;
                tables.forEach(([name, rows]) => { if (Array.isArray(rows) && rows.length > 0) exportRowsToCsv(`${prefix}_${name}.csv`, rows);});
              }}
            >
              Export CSV
            </button>
          }
        </div>
      </div>

      <div className="form-group readings-filters">
        <div className="form-group readings-type">
          <SearchableSelect
            label="Monitor ID"
            value={monitorId}
            onChange={setMonitorId}
            options={monitorOptions}
            placeholder={loadingMonitors ? "Loading..." : "Select monitor..."}
            allowAll={false}
          />
          <SearchableSelect
            label="Reading Type"
            value={tablesChosen}
            onChange={setTablesChosen}
            options={tableOptions}
            placeholder="Select reading type..."
            allowAll={false}
            searchable={false}
            multiple
          />
        </div>

        <div className="form-group readings-date">
          <label htmlFor="from-date">From</label>
          <input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />

          <label htmlFor="to-date">To</label>
          <input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {err && <div className="admin-error">{err}</div>}
      
        <div className="readings-rows">
          {readingsData?.energy_consumption && (
            <div className="readings-row">
              <div className="readings-table">
                <DataTable
                  title="Energy Consumption"
                  rows={readingsData.energy_consumption} 
                  onRowHover={(row) => {
                    const idx = consumptionIndexByTs.get(String(row.Timestamp));
                    highlightPoint(consumptionChartRef.current, idx);
                  }}
                  onRowLeave={() => clearHighlight(consumptionChartRef.current)}
                  highlightRow={(row) => {
                    const a = toMs(row.Timestamp);
                    const b = Number(hoverConsumptionX);
                    return a != null && b != null && a === b;
                  }}
                />
              </div>
              <div className="readings-chart">
                <ChartCard title="Consumption">
                  <LineTimeChart
                    id="consumptionChart"
                    rows={readingsData.energy_consumption}
                    xKey="Timestamp"
                    yKeys={consumptionYKeys}
                    labels={consumptionLabels}
                    chartRef={consumptionChartRef}
                    onHoverX={(x) => setHoverConsumptionX(x)}
                  />
                </ChartCard>
              </div>
          </div>
          )}

          {readingsData?.energy_production && (
            <div className="readings-row">
              <div className="readings-table">
                <DataTable
                  title="Energy Production"
                  rows={readingsData.energy_production} 
                  onRowHover={(row) => {
                    const idx = productionIndexByTs.get(String(row.Timestamp));
                    highlightPoint(productionChartRef.current, idx);
                  }}
                  onRowLeave={() => clearHighlight(productionChartRef.current)}
                  highlightRow={(row) => {
                    const a = toMs(row.Timestamp);
                    const b = Number(hoverProductionX);
                    return a != null && b != null && a === b;
                  }}
                  pageSize={8}
                />
              </div>
              <div className="readings-chart">
                <ChartCard title="Production">
                  <LineTimeChart
                    id="productionChart"
                    rows={readingsData.energy_production}
                    xKey="Timestamp"
                    yKeys={productionYKeys}
                    labels={productionLabels}
                    chartRef={productionChartRef}
                    onHoverX={(x) => setHoverProductionX(x)}
                  />
                </ChartCard>
              </div>
            </div>
          )}

          {readingsData?.environmental_data && (
            <div className="readings-row">
              <div className="readings-table">
                <DataTable
                  title="Environmental Data"
                  rows={readingsData.environmental_data} 
                  onRowHover={(row) => {
                    const idx = environmentalIndexByTs.get(String(row.Timestamp));
                    highlightPoint(environmentalChartRef.current, idx);
                  }}
                  onRowLeave={() => clearHighlight(environmentalChartRef.current)}
                  highlightRow={(row) => {
                    const a = toMs(row.Timestamp);
                    const b = Number(hoverEnvironmentalX);
                    return a != null && b != null && a === b;
                  }}
                />
              </div>
              <div className="readings-chart">
                <ChartCard title="Environmental Data">
                  <LineTimeChart
                    id="environmentalChart"
                    rows={readingsData.environmental_data}
                    xKey="Timestamp"
                    yKeys={envYKeys}
                    labels={envLabels}
                    chartRef={environmentalChartRef}
                    onHoverX={(x) => setHoverEnvironmentalX(x)}
                  />
                </ChartCard>
              </div>
            </div>
          )}

          {readingsData?.solar_panel_data && (
            <div className="readings-row">
              <div className="readings-table">
                <DataTable
                  title="Solar Panels Data"
                  rows={readingsData.solar_panel_data} 
                  onRowHover={(row) => {
                    const idx = solarIndexByTs.get(String(row.Date_Calculated));
                    highlightPoint(solarChartRef.current, idx);
                  }}
                  onRowLeave={() => clearHighlight(solarChartRef.current)}
                  highlightRow={(row) => {
                    const a = toDate(row.Date_Calculated);
                    const b = Number(hoverSolarX);
                    return a != null && b != null && a === b;
                  }}
                />
              </div>
              <div className="readings-chart">
                <ChartCard title="Solar Panels Data">
                  <LineTimeChart
                    id="solarPanelsChart"
                    rows={readingsData.solar_panel_data}
                    xKey="Date_Calculated"
                    yKeys={solarYKeys}
                    labels={solarLabels}
                    chartRef={solarChartRef}
                    onHoverX={(x) => setHoverSolarX(x)}
                  />
                </ChartCard>
              </div>
            </div>
          )}
        </div>

      <div className="readings-note">
        If your backend returns different column names, map them in the table body.
        The UI is ready; only the endpoint response shape needs matching.
      </div>
    </section>
  );
}
