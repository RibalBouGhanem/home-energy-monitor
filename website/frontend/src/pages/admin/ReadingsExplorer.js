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
  const reservesChartRef = useRef(null);
  const environmentalChartRef = useRef(null);
  const solarChartRef = useRef(null);

  const [monitors, setMonitors] = useState([]);
  const [err, setErr] = useState("");
  const [loadingMonitors, setLoadingMonitors] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [readingsData, setReadingsData] = useState(null);
  const [tablesChosen, setTablesChosen] = useState([]);
  const [interval, setInterval] = useState("daily");
  const [loadedKeys, setLoadedKeys] = useState([]);


  const intervalOptions = [
    { value: "daily", label: "Daily (aggregated)" },
    { value: "monthly", label: "Monthly (aggregated)" },
    { value: "yearly", label: "Yearly (aggregated)" },
  ];

  const [monitorId, setMonitorId] = useState(qs.get("monitorId") || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [hoverConsumptionX, setHoverConsumptionX] = useState(null);
  const [hoverProductionX, setHoverProductionX] = useState(null);
  const [hoverReservesX, setHoverReservesX] = useState(null);
  const [hoverEnvironmentalX, setHoverEnvironmentalX] = useState(null);
  const [hoverSolarX, setHoverSolarX] = useState(null);


  const getMonitorId = (m) => (m.Monitor_ID ?? "").toString();
  const monitorOptions = useMemo(() => monitors.map((m) => getMonitorId(m)).filter(Boolean), [monitors]);
  const tableOptions = [
    { value: "_computed_energy_consumption", label: "Energy Consumption" },
    { value: "_computed_energy_production", label: "Energy Production" },
    { value: "_computed_energy_reserves", label: "Energy Reserves" },
    { value: "_computed_environmental_data", label: "Environmental Data" },
    { value: "_computed_solar_panel_data", label: "Solar Panel Data" },
  ];

  const resolveTableByInterval = (table, interval) => {
  return `${table}_${interval}`;
};



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

  const reservesIndexByTs = useMemo(() => {
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
    (readingsData?._computed_solar_panel_data_daily || []).forEach((r, i) => {
      if (r?.Date_Calculated) map.set(String(r.Date_Calculated), i);
    });
    return map;
  }, [readingsData]);
  
  const consumptionYKeys = useMemo(() => ["Total_Consumption"], []);
  const productionYKeys = useMemo(() => ["Total_Production"], []);
  const reservesYKeys = useMemo(() => ["Reserve_Amount"], []);
  const avgReservesYKeys = useMemo(() => ["Avg_Reserve_Amount"], []);
  const envYKeys = useMemo(() => ["Avg_Temperature", "Avg_Humidity", "Avg_Light_Intensity"], []);
  const solarYKeys = useMemo(() => ["Theoretical_Panel_Production",	"Avg_Exact_Panel_Production", "Avg_Panel_Efficiency",	"Total_Energy_Generated"], []);
  
  const consumptionLabels = useMemo(() => ({Total_Consumption: "Consumption"}), []);
  const productionLabels = useMemo(() => ({ Total_Production: "Production" }), []);
  const reservesLabels = useMemo(() => ({ Reserve_Amount: "Rserve" }), []);
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
  
  const TABLES = useMemo(() => ({
    _computed_energy_consumption_daily: {
      title: "Energy Consumption",
      chartTitle: "Consumption",
      xKey: "Timestamp",
      yKeys: consumptionYKeys,
      labels: consumptionLabels,
      chartRef: consumptionChartRef,
      getHoverX: () => hoverConsumptionX,
      setHoverX: setHoverConsumptionX,
      indexByX: consumptionIndexByTs, // Map(xString -> index)
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_energy_consumption_monthly: {
      title: "Energy Consumption",
      chartTitle: "Consumption",
      xKey: "Timestamp",
      yKeys: consumptionYKeys,
      labels: consumptionLabels,
      chartRef: consumptionChartRef,
      getHoverX: () => hoverConsumptionX,
      setHoverX: setHoverConsumptionX,
      indexByX: consumptionIndexByTs, // Map(xString -> index)
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_energy_consumption_yearly: {
      title: "Energy Consumption",
      chartTitle: "Consumption",
      xKey: "Timestamp",
      yKeys: consumptionYKeys,
      labels: consumptionLabels,
      chartRef: consumptionChartRef,
      getHoverX: () => hoverConsumptionX,
      setHoverX: setHoverConsumptionX,
      indexByX: consumptionIndexByTs, // Map(xString -> index)
      xToComparable: (v) => new Date(v).getTime(),
    },
  
    _computed_energy_production_daily: {
      title: "Energy Production",
      chartTitle: "Production",
      xKey: "Timestamp",
      yKeys: productionYKeys,
      labels: productionLabels,
      chartRef: productionChartRef,
      getHoverX: () => hoverProductionX,
      setHoverX: setHoverProductionX,
      indexByX: productionIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_energy_production_monthly: {
      title: "Energy Production",
      chartTitle: "Production",
      xKey: "Timestamp",
      yKeys: productionYKeys,
      labels: productionLabels,
      chartRef: productionChartRef,
      getHoverX: () => hoverProductionX,
      setHoverX: setHoverProductionX,
      indexByX: productionIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_energy_production_yearly: {
      title: "Energy Production",
      chartTitle: "Production",
      xKey: "Timestamp",
      yKeys: productionYKeys,
      labels: productionLabels,
      chartRef: productionChartRef,
      getHoverX: () => hoverProductionX,
      setHoverX: setHoverProductionX,
      indexByX: productionIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
  
    _computed_energy_reserves_daily: {
      title: "Energy Reserves",
      chartTitle: "Reserves",
      xKey: "Timestamp",
      yKeys: reservesYKeys,
      labels: reservesLabels,
      chartRef: reservesChartRef,
      getHoverX: () => hoverReservesX,
      setHoverX: setHoverReservesX,
      indexByX: reservesIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_energy_reserves_monthly: {
      title: "Energy Reserves",
      chartTitle: "Reserves",
      xKey: "Timestamp",
      yKeys: avgReservesYKeys,
      labels: reservesLabels,
      chartRef: reservesChartRef,
      getHoverX: () => hoverReservesX,
      setHoverX: setHoverReservesX,
      indexByX: reservesIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_energy_reserves_yearly: {
      title: "Energy Reserves",
      chartTitle: "Reserves",
      xKey: "Timestamp",
      yKeys: avgReservesYKeys,
      labels: reservesLabels,
      chartRef: reservesChartRef,
      getHoverX: () => hoverReservesX,
      setHoverX: setHoverReservesX,
      indexByX: reservesIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    
    _computed_environmental_data_daily: {
      title: "Environmental Data",
      chartTitle: "Environmental Data",
      xKey: "Timestamp",
      yKeys: envYKeys,
      labels: envLabels,
      chartRef: environmentalChartRef,
      getHoverX: () => hoverEnvironmentalX,
      setHoverX: setHoverEnvironmentalX,
      indexByX: environmentalIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_environmental_data_monthly: {
      title: "Environmental Data",
      chartTitle: "Environmental Data",
      xKey: "Timestamp",
      yKeys: envYKeys,
      labels: envLabels,
      chartRef: environmentalChartRef,
      getHoverX: () => hoverEnvironmentalX,
      setHoverX: setHoverEnvironmentalX,
      indexByX: environmentalIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    _computed_environmental_data_yearly: {
      title: "Environmental Data",
      chartTitle: "Environmental Data",
      xKey: "Timestamp",
      yKeys: envYKeys,
      labels: envLabels,
      chartRef: environmentalChartRef,
      getHoverX: () => hoverEnvironmentalX,
      setHoverX: setHoverEnvironmentalX,
      indexByX: environmentalIndexByTs,
      xToComparable: (v) => new Date(v).getTime(),
    },
    
    _computed_solar_panel_data_daily: {
      title: "Solar Panels Data",
      chartTitle: "Solar Panels Data",
      xKey: "Timestamp",
      yKeys: solarYKeys,
      labels: solarLabels,
      chartRef: solarChartRef,
      getHoverX: () => hoverSolarX,
      setHoverX: setHoverSolarX,
      indexByX: solarIndexByTs, // your solarIndexByTs uses Date_Calculated
      xToComparable: (v) => new Date(v).getTime(), // safer than getDate()
    },
    _computed_solar_panel_data_monthly: {
      title: "Solar Panels Data",
      chartTitle: "Solar Panels Data",
      xKey: "Timestamp",
      yKeys: solarYKeys,
      labels: solarLabels,
      chartRef: solarChartRef,
      getHoverX: () => hoverSolarX,
      setHoverX: setHoverSolarX,
      indexByX: solarIndexByTs, // your solarIndexByTs uses Date_Calculated
      xToComparable: (v) => new Date(v).getTime(), // safer than getDate()
    },
    _computed_solar_panel_data_yearly: {
      title: "Solar Panels Data",
      chartTitle: "Solar Panels Data",
      xKey: "Timestamp",
      yKeys: solarYKeys,
      labels: solarLabels,
      chartRef: solarChartRef,
      getHoverX: () => hoverSolarX,
      setHoverX: setHoverSolarX,
      indexByX: solarIndexByTs, // your solarIndexByTs uses Date_Calculated
      xToComparable: (v) => new Date(v).getTime(), // safer than getDate()
    },
  }), [
    consumptionYKeys, consumptionLabels, consumptionIndexByTs, hoverConsumptionX,
    productionYKeys, productionLabels, productionIndexByTs, hoverProductionX,
    envYKeys, envLabels, environmentalIndexByTs, hoverEnvironmentalX,
    solarYKeys, solarLabels, solarIndexByTs, hoverSolarX,
  ]);

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

    const resolvedTables = (tablesChosen || [])
      .map((t) => (typeof t === "string" ? t : t?.value))
      .filter(Boolean)
      .map((t) => resolveTableByInterval(t, interval));
      
      setLoadedKeys([...new Set(resolvedTables)]);
      
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
            disabled={(loadingRows || loadingMonitors) && interval && tablesChosen}
          >
            Load
          </button>
          {readingsData && 
            <button
              type="button"
              className="secondary-button"
              disabled={!readingsData}
              onClick={() => {
                const prefix = `monitor_${monitorId}`;
                tablesChosen.forEach(([name, rows]) => { if (Array.isArray(rows) && rows.length > 0) exportRowsToCsv(`${prefix}_${name}.csv`, rows);});
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
          {/* <SearchableSelect
            label="Reading Type"
            value={tablesChosen}
            onChange={setTablesChosen}
            options={tableOptions}
            placeholder="Select reading type..."
            allowAll={false}
            searchable={false}
            multiple
          /> */}
          <SearchableSelect
            label="Interval"
            value={interval}
            onChange={setInterval}
            options={intervalOptions}
            placeholder="Select interval..."
            allowAll={false}
            searchable={false}
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
        {Object.entries(readingsData || {}).map(([key, rows]) => {
          const cfg = TABLES[key];
          if (!cfg) return null;                 // unknown table key
          if (!Array.isArray(rows) || !rows.length) return null;
          const indexByX = new Map();
          rows.forEach((r, i) => indexByX.set(String(r?.[cfg.xKey]), i));
          
          return (
            <div className="readings-row" key={key}>
              <div className="readings-table">
                <DataTable
                  title={cfg.title}
                  rows={rows}
                  onRowHover={(row) => {
                    const xVal = row?.[cfg.xKey];
                    const idx = indexByX.get(String(xVal));
                    highlightPoint(cfg.chartRef.current, idx);
                  }}
                  onRowLeave={() => clearHighlight(cfg.chartRef.current)}
                  highlightRow={(row) => {
                    const a = cfg.xToComparable(row?.[cfg.xKey]);
                    const b = Number(cfg.getHoverX());
                    return a != null && b != null && a === b;
                  }}
                  pageSize={8}
                />
              </div>

              <div className="readings-chart">
                <ChartCard title={cfg.chartTitle}>
                  <LineTimeChart
                    id={`${key}-chart`}
                    rows={rows}
                    xKey={cfg.xKey}
                    yKeys={cfg.yKeys}
                    labels={cfg.labels}
                    chartRef={cfg.chartRef}
                    onHoverX={(x) => cfg.setHoverX(x)}
                  />
                </ChartCard>
              </div>
            </div>
          );
        })}
      </div>

      <div className="readings-note">
        If your backend returns different column names, map them in the table body.
        The UI is ready; only the endpoint response shape needs matching.
      </div>
    </section>
  );
}
