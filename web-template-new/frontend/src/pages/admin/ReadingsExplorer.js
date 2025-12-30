import React, { useRef, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { data as readingsData, useLocation } from "react-router-dom";
import Chart from "chart.js/auto";
import SearchableSelect from "../../components/SearchableSelect";
import DataTable from "../../components/DataTable";
import ReadingsChart from "../../components/ReadingsChart";
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
  const reservesChartRef = useRef(null);

  const [monitors, setMonitors] = useState([]);
  const [err, setErr] = useState("");
  const [loadingMonitors, setLoadingMonitors] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);

  const [readingsData, setReadingsData] = useState(null);
  const [tableOption, setTableOption] = useState("");

  const [monitorId, setMonitorId] = useState(qs.get("monitorId") || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [hoverConsumptionX, setHoverConsumptionX] = useState(null);
  const [hoverProductionX, setHoverProductionX] = useState(null);
  const [hoverEnvironmentalX, setHoverEnvironmentalX] = useState(null);


  const getMonitorId = (m) => (m.Monitor_ID ?? m.monitorId ?? m.id ?? "").toString();
  const monitorOptions = useMemo(
    () => monitors.map((m) => getMonitorId(m)).filter(Boolean),
    [monitors]
  );
  const tableOptions = useMemo(() => ["All", "Consumption", "Production", "Environmental Data", "Solar Panel Data"], []);

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
  
  const consumptionLabels = useMemo(() => ({Consumption_Value: "Consumption"}), []);
  const consumptionYKeys = useMemo(() => ["Consumption_Value"], []);
  const productionYKeys = useMemo(() => ["Production_Value"], []);
  const envYKeys = useMemo(() => ["Temperature", "Humidity", "Light_Intensity"], []);

  const productionLabels = useMemo(() => ({ Production_Value: "Production" }), []);
  const envLabels = useMemo(
    () => ({
      Temperature: "Temp",
      Humidity: "Humidity",
      Light_Intensity: "Light",
    }),
    []
  );

  
  const loadMonitors = async () => {
    try {
      setErr("");
      setLoadingMonitors(true);
      const res = await api.get("/api/monitors");
      setMonitors(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("READINGS MONITORS ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load monitors.");
    } finally {
      setLoadingMonitors(false);
    }
  };

  const fetchMonitorData = async () => {
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
      params.set("limit", "200");

      const res = await api.get(`/api/monitor/${monitorId}/data?${params.toString()}`);
      setReadingsData(res.data);
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

  const toMs = (v) => { {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : null;
  }};

  return (
    <section className="admin-page readings-page">
      <div className="admin-page-header">
        <h2 className="section-title">Readings Explorer</h2>

        <div className="readings-actions">
          <button
            type="button"
            className="cta-button"
            onClick={fetchMonitorData}
            disabled={loadingRows || loadingMonitors}
          >
            Load
          </button>
          {readingsData && <button
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
                ["solar_system_data", readingsData.solar_system_data],
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
            value={tableOption}
            onChange={setTableOption}
            options={tableOptions}
            placeholder="Select reading type..."
            allowAll={false}
            searchable={false}
          />
        </div>

        <div className="form-group readings-date">
          <label htmlFor="from-date">From</label>
          <input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="form-group readings-date">
          <label htmlFor="to-date">To</label>
          <input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {err && <div className="admin-error">{err}</div>}
      
      {readingsData && (
        <div className="readings-rows">
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
        </div>
      )}

      <div className="readings-note">
        If your backend returns different column names, map them in the table body.
        The UI is ready; only the endpoint response shape needs matching.
      </div>
    </section>
  );
}
