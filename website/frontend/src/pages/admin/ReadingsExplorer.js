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

  const showDaily = interval === "daily";
  const showMonthly = interval === "monthly";
  const showYearly = interval === "yearly";

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

      const uniqueKeys = [...new Set(resolvedTables)];
      setLoadedKeys(uniqueKeys);
      
      console.log(`/api/monitor/${monitorId}/data?${params.toString()}`);
      const res = await api.get(`/api/monitor/${monitorId}/data?${params.toString()}`);
      const filtered = filterPayloadByRange(res.data, from, to, uniqueKeys);
    setReadingsData(filtered);

    } catch (e) {
      console.log("FETCH MONITOR DATA ERROR:", e);
      setErr(e?.response?.data?.message || "Failed to load monitor data.");
      setReadingsData(null);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {loadMonitors();}, []);

  const toTime = (v) => {
    if (!v) return NaN;
    // supports "YYYY-MM-DD", ISO strings, Date objects
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : NaN;
  };
  const inDateRange = (row, from, to) => {
    const x =
      row?.Timestamp ??
      row?.Date_Calculated ??
      row?.Date ??
      row?.timestamp ??
      row?.date_calculated;

    const tx = toTime(x);
    if (!Number.isFinite(tx)) return false;

    const a = from ? toTime(from) : -Infinity;
    const b = to ? toTime(to) : Infinity;

    return tx >= a && tx <= b;
  };
  const filterPayloadByRange = (payload, from, to, keysToFilter) => {
    if (!payload || (!from && !to)) return payload;

    // If keysToFilter is provided, only filter those arrays (safer + faster).
    const out = { ...payload };

    const keys = Array.isArray(keysToFilter) && keysToFilter.length
      ? keysToFilter
      : Object.keys(out);

    for (const k of keys) {
      if (Array.isArray(out[k])) {
        out[k] = out[k].filter((row) => inDateRange(row, from, to));
      }
    }

    return out;
  };
  
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
  {showDaily && readingsData?._computed_energy_consumption_daily && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Consumption"
          rows={readingsData._computed_energy_consumption_daily}
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
            rows={readingsData._computed_energy_consumption_daily}
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

  {showMonthly && readingsData?._computed_energy_consumption_monthly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Consumption"
          rows={readingsData._computed_energy_consumption_monthly}
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
            rows={readingsData._computed_energy_consumption_monthly}
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

  {showYearly && readingsData?._computed_energy_consumption_yearly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Consumption"
          rows={readingsData._computed_energy_consumption_yearly}
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
            rows={readingsData._computed_energy_consumption_yearly}
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

  {showDaily && readingsData?._computed_energy_production_daily && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Production"
          rows={readingsData._computed_energy_production_daily}
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
            rows={readingsData._computed_energy_production_daily}
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

  {showMonthly && readingsData?._computed_energy_production_monthly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Production"
          rows={readingsData._computed_energy_production_monthly}
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
            rows={readingsData._computed_energy_production_monthly}
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

  {showYearly && readingsData?._computed_energy_production_yearly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Production"
          rows={readingsData._computed_energy_production_yearly}
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
            rows={readingsData._computed_energy_production_yearly}
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

  {showDaily && readingsData?._computed_energy_reserves_daily && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Reserves"
          rows={readingsData._computed_energy_reserves_daily}
          onRowHover={(row) => {
            const idx = reservesIndexByTs.get(String(row.Timestamp));
            highlightPoint(reservesChartRef.current, idx);
          }}
          onRowLeave={() => clearHighlight(reservesChartRef.current)}
          highlightRow={(row) => {
            const a = toMs(row.Timestamp);
            const b = Number(hoverReservesX);
            return a != null && b != null && a === b;
          }}
        />
      </div>
      <div className="readings-chart">
        <ChartCard title="Reserves">
          <LineTimeChart
            id="reservesChart"
            rows={readingsData._computed_energy_reserves_daily}
            xKey="Timestamp"
            yKeys={reservesYKeys}
            labels={reservesLabels}
            chartRef={reservesChartRef}
            onHoverX={(x) => setHoverReservesX(x)}
          />
        </ChartCard>
      </div>
    </div>
  )}

  {showMonthly && readingsData?._computed_energy_reserves_monthly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Reserves"
          rows={readingsData._computed_energy_reserves_monthly}
          onRowHover={(row) => {
            const idx = reservesIndexByTs.get(String(row.Timestamp));
            highlightPoint(reservesChartRef.current, idx);
          }}
          onRowLeave={() => clearHighlight(reservesChartRef.current)}
          highlightRow={(row) => {
            const a = toMs(row.Timestamp);
            const b = Number(hoverReservesX);
            return a != null && b != null && a === b;
          }}
        />
      </div>
      <div className="readings-chart">
        <ChartCard title="Reserves">
          <LineTimeChart
            id="reservesChart"
            rows={readingsData._computed_energy_reserves_monthly}
            xKey="Timestamp"
            yKeys={reservesYKeys}
            labels={reservesLabels}
            chartRef={reservesChartRef}
            onHoverX={(x) => setHoverReservesX(x)}
          />
        </ChartCard>
      </div>
    </div>
  )}

  {showYearly && readingsData?._computed_energy_reserves_yearly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Energy Reserves"
          rows={readingsData._computed_energy_reserves_yearly}
          onRowHover={(row) => {
            const idx = reservesIndexByTs.get(String(row.Timestamp));
            highlightPoint(reservesChartRef.current, idx);
          }}
          onRowLeave={() => clearHighlight(reservesChartRef.current)}
          highlightRow={(row) => {
            const a = toMs(row.Timestamp);
            const b = Number(hoverReservesX);
            return a != null && b != null && a === b;
          }}
        />
      </div>
      <div className="readings-chart">
        <ChartCard title="Reserves">
          <LineTimeChart
            id="reservesChart"
            rows={readingsData._computed_energy_reserves_yearly}
            xKey="Timestamp"
            yKeys={reservesYKeys}
            labels={reservesLabels}
            chartRef={reservesChartRef}
            onHoverX={(x) => setHoverReservesX(x)}
          />
        </ChartCard>
      </div>
    </div>
  )}

  {showDaily && readingsData?._computed_environmental_data_daily && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Environmental Data"
          rows={readingsData._computed_environmental_data_daily}
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
            rows={readingsData._computed_environmental_data_daily}
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

  {showMonthly && readingsData?._computed_environmental_data_monthly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Environmental Data"
          rows={readingsData._computed_environmental_data_monthly}
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
            rows={readingsData._computed_environmental_data_monthly}
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

  {showYearly && readingsData?._computed_environmental_data_yearly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Environmental Data"
          rows={readingsData._computed_environmental_data_yearly}
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
            rows={readingsData._computed_environmental_data_yearly}
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

  {showDaily && readingsData?._computed_solar_panel_data_daily && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Solar Panels Data"
          rows={readingsData._computed_solar_panel_data_daily}
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
            rows={readingsData._computed_solar_panel_data_daily}
            xKey="Timestamp"
            yKeys={solarYKeys}
            labels={solarLabels}
            chartRef={solarChartRef}
            onHoverX={(x) => setHoverSolarX(x)}
          />
        </ChartCard>
      </div>
    </div>
  )}

  {showMonthly && readingsData?._computed_solar_panel_data_monthly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Solar Panels Data"
          rows={readingsData._computed_solar_panel_data_monthly}
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
            rows={readingsData._computed_solar_panel_data_monthly}
            xKey="Timestamp"
            yKeys={solarYKeys}
            labels={solarLabels}
            chartRef={solarChartRef}
            onHoverX={(x) => setHoverSolarX(x)}
          />
        </ChartCard>
      </div>
    </div>
  )}

  {showYearly && readingsData?._computed_solar_panel_data_yearly && (
    <div className="readings-row">
      <div className="readings-table">
        <DataTable
          title="Solar Panels Data"
          rows={readingsData._computed_solar_panel_data_yearly}
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
            rows={readingsData._computed_solar_panel_data_yearly}
            xKey="Timestamp"
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
