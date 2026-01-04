import express from "express";
import cors from "cors";
import mysql from "mysql";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import contactRoutes from "./routes/contact.routes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/api/contact", contactRoutes);



const companyDB = {
  host: "localhost",
  user: "root",
  password: "",
  database: "company_energy_monitor",
}

// TO-DO: if implementing multiple databases for the corresponding websites fails, remove the following line and always use companyDB, 
// and create a new react project for home_energy_monitor by copying this project and excluding certain pages and components such as login, admin, and others

const db = mysql.createConnection(companyDB); // default to use companyDB

db.connect((err) => {
  if (err) console.log("DB CONNECT ERROR:", err);
  else console.log("DB connected");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const q = "SELECT email, isAdmin, password FROM accounts WHERE email = ?";
  db.query(q, [email], (err, data) => {
    if (data.length === 0) {
      console.log("INVALID CREDENTIALS:", email, err);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const passwordMatch = bcrypt.compareSync(password, data[0].password);
    if (passwordMatch) {
      const user = data[0];
      if (user.isAdmin) {
        return res.json({
          user: {
              email: user.email,
              isAdmin: user.isAdmin,
          },
          token: "authenticated"
      });
      }
      const monitorsQ = `SELECT m.Monitor_ID, a.Name, m.Location, m.Status, m.Microprocessor_Type, m.Installation_Date 
                        FROM monitors m
                        LEFT JOIN accounts a
                        ON m.User_Email = a.Email`
      db.query(monitorsQ, [], (error, data1) => {
        if (error) return res.status(500).json({ message: "DB error" });
        if (data1.length === 0) console.log("Monitor not found for:", email, error);
        return res.json({
            user: {
              email: user.email,
              isAdmin: user.isAdmin,
            },
            token: "authenticated",
            monitors: data1
        });
      });
    }
    if (err) {
      console.log("LOGIN DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
  });
});

app.get("/api/accounts", (req, res) => {
  const q = "SELECT email, name, phoneNumber, monitorType, subscriptionType FROM accounts";
  db.query(q, (err, data) => {
    if (err) {
      console.log("ACCOUNTS DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json(data);
  });
});

app.post("/api/accounts", async (req, res) => {
  const q = "INSERT INTO accounts (email, name, password, isAdmin, phoneNumber, monitorType, subscriptionType) VALUES (?, ?, ?, 0, ?, ?, ?)";
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
    const values = [
      req.body.email,
      req.body.name,
      hashedPassword,
      req.body.phoneNumber,
      req.body.monitorType,
      req.body.subscriptionType
    ];
    
    db.query(q, values, async (err, data) => {
      if (err) {
        console.log("ACCOUNTS POST DB ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      // log after success
      try {
        const actorEmail = getActorEmail(req);
        await insertSystemLog(db, actorEmail, {
          action: "CREATE",
          table: "accounts",
          record: { email: req.body.email },
        });
      } catch (logErr) {
        console.error("SYSTEM LOG INSERT FAILED (non-fatal):", logErr);
      }


      return res.json({ message: "Account created successfully" });
    });
  } catch (e) {
    console.log("HASH/REQUEST ERROR::", e);
    return res.status(500).json({ message: "DB error" });
  }
});


app.delete("/api/accounts/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  
  const q = "DELETE FROM accounts WHERE Email = ?";
  db.query(q, [email], async (err, data) => {
    if (err) {
      console.log("ACCOUNTS DELETE DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    } else if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    try {
      const actorEmail = getActorEmail(req);
      await insertSystemLog(db, req, actorEmail, {
        action: "DELETE",
        table: "accounts",
        record: { email },
      });
    } catch (e) {
      console.log("SYSTEM LOG INSERT ERROR:", e);
      // don’t block delete if logging fails
    }

    return res.json({ message: "Account deleted successfully" });
  });
});

app.get("/api/monitors", (req, res) => {
  const q = "SELECT * FROM monitors";
  db.query(q, (err, data) => {
    if (err) {
      console.log("MONITORS DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json(data);
  });
});

app.put("/api/monitors/:id", (req, res) => {
  const id = req.params.id;
  
  const { Account_Email, Location, Status, Microprocessor_Type, Installation_Date } = req.body;
  
  const q = "UPDATE monitors SET Account_Email=?, Location=?, Status=?, Microprocessor_Type=?, Installation_Date=? WHERE Monitor_ID=?";
  db.query(q, [Account_Email, Location, Status, Microprocessor_Type, Installation_Date || null, id], async (err, data) => {
    if (err) {
      console.log("MONITOR UPDATE DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    
    try {
      const actorEmail = getActorEmail(req);
      await insertSystemLog(db, req, actorEmail, {
        action: "UPDATE",
        table: "monitors",
        record: { Monitor_ID: id },
        changes: { Account_Email, Location, Status, Microprocessor_Type, Installation_Date: Installation_Date || null },
      });
    } catch (e) {
      console.log("SYSTEM LOG INSERT ERROR:", e);
    }

    return res.json({ message: "Monitor updated successfully" });
  });
});


app.delete("/api/monitors/:id", (req, res) => {
  const id = req.params.id;
  
  const q = "DELETE FROM monitors WHERE Monitor_ID=?";
  db.query(q, [id], async (err, data) => {
    if (err) {
      console.log("MONITOR DELETE DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    } else if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    
    try {
      const actorEmail = getActorEmail(req);
      await insertSystemLog(db, req, actorEmail, {
        action: "DELETE",
        table: "monitors",
        record: { Monitor_ID: id },
      });
    } catch (e) {
      console.log("SYSTEM LOG INSERT ERROR:", e);
    }

    return res.json({ message: "Monitor deleted successfully" });
  });
});


app.get("/api/monitor/:monitorId/data", (req, res) => {
  const monitorId = Number(req.params.monitorId);
  const { from, to, limit } = req.query;

  if (!monitorId) {
    return res.status(400).json({ message: "Valid monitorId is required" });
  }

  const hasRange = from && to;
  const rowLimit = Number(limit) > 0 ? Number(limit) : 200;

  // Helper to run queries safely
  const run = (sql, params) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

  (async () => {
    try {
      // monitors (single row usually)
      const monitorsSql = `
        SELECT Monitor_ID
        FROM monitors
        WHERE Monitor_ID = ?
      `;
      const monitorsRows = await run(monitorsSql, [monitorId]);

      // energy_consumption
      const consumptionParams = hasRange ? [monitorId, from, to, from, to] : [monitorId];
      const consumptionDSql = `
        SELECT Date AS Timestamp, Total_Consumption
        FROM _computed_energy_consumption_daily
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Date >= ? AND Date <= ?" : ""}
        ORDER BY Timestamp DESC
      `;
      const consumptionMSql = `
        SELECT STR_TO_DATE(CONCAT(Year,'-',LPAD(Month,2,'0'),'-01'), '%Y-%m-%d') AS Timestamp, Total_Consumption
        FROM _computed_energy_consumption_monthly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Month >= MONTH(?) AND Month <= MONTH(?) AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const consumptionYSql = `
        SELECT Year AS Timestamp, Total_Consumption
        FROM _computed_energy_consumption_yearly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const consumptionDRows = await run(consumptionDSql, consumptionParams);
      const consumptionMRows = await run(consumptionMSql, consumptionParams);
      const consumptionYRows = await run(consumptionYSql, consumptionParams);

      // energy_production
      const productionParams = hasRange ? [monitorId, from, to, from, to] : [monitorId];
      const productionDSql = `
        SELECT Date AS Timestamp, Total_Production
        FROM _computed_energy_production_daily
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Date >= ? AND Date <= ?" : ""}
        ORDER BY Timestamp DESC
      `;
      const productionMSql = `
        SELECT STR_TO_DATE(CONCAT(Year,'-',LPAD(Month,2,'0'),'-01'), '%Y-%m-%d') AS Timestamp, Total_Production
        FROM _computed_energy_production_monthly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Month >= MONTH(?) AND Month <= MONTH(?) AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const productionYSql = `
        SELECT Year AS Timestamp, Total_Production
        FROM _computed_energy_production_yearly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const productionDRows = await run(productionDSql, productionParams);
      const productionMRows = await run(productionMSql, productionParams);
      const productionYRows = await run(productionYSql, productionParams);

      // environmental_data
      const envParams = hasRange ? [monitorId, from, to, from, to] : [monitorId];
      const envDSql = `
        SELECT Date AS Timestamp, Avg_Light_Intensity, Avg_Temperature, Avg_Humidity
        FROM _computed_environmental_data_daily
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Date >= ? AND Date <= ?" : ""}
        ORDER BY Timestamp DESC
      `;
      const envMSql = `
        SELECT STR_TO_DATE(CONCAT(Year,'-',LPAD(Month,2,'0'),'-01'), '%Y-%m-%d') AS Timestamp, Avg_Light_Intensity, Avg_Temperature, Avg_Humidity
        FROM _computed_environmental_data_monthly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Month >= MONTH(?) AND Month <= MONTH(?) AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const envYSql = `
        SELECT Year AS Timestamp, Avg_Light_Intensity, Avg_Temperature, Avg_Humidity
        FROM _computed_environmental_data_yearly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const envDRows = await run(envDSql, envParams);
      const envMRows = await run(envMSql, envParams);
      const envYRows = await run(envYSql, envParams);

      // energy_reserves
      const reservesParams = hasRange ? [monitorId, from, to, from, to] : [monitorId];
      const reservesDSql = `
        SELECT Date AS Timestamp, Reserve_Amount
        FROM _computed_energy_reserves_daily
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Date >= ? AND Date <= ?" : ""}
        ORDER BY Timestamp DESC
      `;
      const reservesMSql = `
        SELECT STR_TO_DATE(CONCAT(Year,'-',LPAD(Month,2,'0'),'-01'), '%Y-%m-%d') AS Timestamp, Avg_Reserve_Amount
        FROM _computed_energy_reserves_monthly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Month >= MONTH(?) AND Month <= MONTH(?) AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const reservesYSql = `
        SELECT Year AS Timestamp, Avg_Reserve_Amount
        FROM _computed_energy_reserves_yearly
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
        ORDER BY Timestamp DESC
      `;
      const reservesDRows = await run(reservesDSql, reservesParams);
      const reservesMRows = await run(reservesMSql, reservesParams);
      const reservesYRows = await run(reservesYSql, reservesParams);

      // notifications
      const notificationsSql = `
        SELECT Timestamp, Notification_Type
        FROM notifications
        WHERE Monitor_ID = ?
        ORDER BY Notification_ID DESC
      `;
      const notificationsRows = await run(notificationsSql, [monitorId]);

      // sell_request
      const sellSql = `
        SELECT Request_Date, Status
        FROM sell_request
        WHERE Monitor_ID = ?
        ORDER BY Request_Date DESC
      `;
      const sellRows = await run(sellSql, [monitorId]);

      // solar_panel_data
      const solarParams = hasRange ? [monitorId, from, to, from, to] : [monitorId];
      const solarDSql = `
        SELECT Date_Calculated AS Timestamp, Theoretical_Panel_Production, Exact_Panel_Production, Panel_Efficiency, Total_Energy_Generated
          FROM _computed_solar_panel_data_daily
          WHERE Monitor_ID = ?
          ${hasRange ? "AND Date_Calculated >= ? AND Date_Calculated <= ?" : ""}
          ORDER BY Timestamp DESC
      `;
      const solarMSql = `
        SELECT STR_TO_DATE(CONCAT(Year,'-',LPAD(Month,2,'0'),'-01'), '%Y-%m-%d') AS Timestamp, Theoretical_Panel_Production, Avg_Exact_Panel_Production, Avg_Panel_Efficiency, Total_Energy_Generated
          FROM _computed_solar_panel_data_monthly
          WHERE Monitor_ID = ?
        ${hasRange ? "AND Month >= MONTH(?) AND Month <= MONTH(?) AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
          ORDER BY Timestamp DESC
      `;
      const solarYSql = `
        SELECT Year AS Timestamp, Theoretical_Panel_Production, Avg_Exact_Panel_Production, Avg_Panel_Efficiency, Total_Energy_Generated
          FROM _computed_solar_panel_data_yearly
          WHERE Monitor_ID = ?
        ${hasRange ? "AND Year >= YEAR(?) AND Year <= YEAR(?)" : ""}
          ORDER BY Timestamp DESC
      `;
      const solarDRows = await run(solarDSql, solarParams);
      const solarMRows = await run(solarMSql, solarParams);
      const solarYRows = await run(solarYSql, solarParams);

      return res.json({
        monitorId,
        monitors: monitorsRows,
        notifications: notificationsRows,
        sell_request: sellRows,
        _computed_energy_consumption_daily: consumptionDRows,
        _computed_energy_consumption_monthly: consumptionMRows,
        _computed_energy_consumption_yearly: consumptionYRows,
        _computed_energy_production_daily: productionDRows,
        _computed_energy_production_monthly: productionMRows,
        _computed_energy_production_yearly: productionYRows,
        _computed_environmental_data_daily: envDRows,
        _computed_environmental_data_monthly: envMRows,
        _computed_environmental_data_yearly: envYRows,
        _computed_energy_reserves_daily: reservesDRows,
        _computed_energy_reserves_monthly: reservesMRows,
        _computed_energy_reserves_yearly: reservesYRows,
        _computed_solar_panel_data_daily: solarDRows,
        _computed_solar_panel_data_monthly: solarMRows,
        _computed_solar_panel_data_yearly: solarYRows,
      });
    } catch (err) {
      console.error("MONITOR DATA DB ERROR:", err);
      return res.status(500).json({ message: "DB error", error: err.sqlMessage });
    }
  })();
});

app.get("/api/system-logs", (req, res) => {
  db.query(
    "SELECT Log_ID, Actor_Email, Details, Datetime FROM system_logs ORDER BY Datetime DESC",
    (err, data) => {
      if (err) {
        console.log("SYSTEM LOGS DB ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      return res.json(data);
    }
  );
});

function getActorEmail(req) {
  const email = req.headers["x-user-email"];
  if (!email) {
    throw new Error("Missing actor email (x-user-email header)");
  }
  return email;
}

function nowMysqlDatetime() {
  // "YYYY-MM-DD HH:MM:SS"
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function insertSystemLog(db, req, actorEmail, detailsObjOrString) {
  const details =
    typeof detailsObjOrString === "string"
      ? detailsObjOrString
      : JSON.stringify(detailsObjOrString);

  const q = `INSERT INTO system_logs (Actor_Email, Details, Datetime) VALUES (?, ?, ?)`;

  return new Promise((resolve, reject) => {
    db.query(q, [actorEmail, details, nowMysqlDatetime()], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}


app.listen(5000, () => console.log("Backend running on http://localhost:5000"));