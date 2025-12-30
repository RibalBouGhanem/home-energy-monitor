import express from "express";
import cors from "cors";
import mysql from "mysql";
import bcrypt from "bcrypt";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const dbConfigs = { // tried to do something where different databases could be used depending on which website was opened but never finished it
    companyDB: {
        host: "localhost",
        user: "root",
        password: "",
        database: "company_energy_monitor",
    },
    homeDB: {
        host: "localhost",
        user: "root",
        password: "",
        database: "home_energy_monitor",
    },
}

// TO-DO: if implementing multiple databases for the corresponding websites fails, remove the following line and always use companyDB, 
// and create a new react project for home_energy_monitor by copying this project and excluding certain pages and components such as login, admin, and others

const db = mysql.createConnection(dbConfigs.companyDB); // default to use companyDB

db.connect((err) => {
  if (err) console.log("DB CONNECT ERROR:", err);
  else console.log("DB connected");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const q = "SELECT email, isAdmin, password FROM accounts WHERE email = ?";
  db.query(q, [email, password], (err, data) => {
    const passwordMatch = bcrypt.compareSync(password, data[0].password);
    if (data.length === 0) {
      console.log("INVALID CREDENTIALS:", email, err);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (passwordMatch) {
      const user = data[0];
  
      return res.json({
          user: {
              email: user.email,
              isAdmin: user.isAdmin,
          },
          token: "authenticated"
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
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
  const values = [
    req.body.email,
    req.body.name,
    hashedPassword,
    req.body.phoneNumber,
    req.body.monitorType,
    req.body.subscriptionType
  ];
  db.query(q, values, (err, data) => {
    if (err) {
      console.log("ACCOUNTS POST DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json({ message: "Account created successfully" });
  });
});

app.delete("/api/accounts/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const q = "DELETE FROM accounts WHERE Email = ?";
  db.query(q, [email], (err, data) => {
    if (err) {
      console.log("ACCOUNTS DELETE DB ERROR:", err);
      return res.status(500).json({ message: "DB error"});
    } else if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.json({ message: "Account deleted successfully" });
  })
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
  db.query(q, [Account_Email, Location, Status, Microprocessor_Type, Installation_Date || null, id], (err, data) => {
    if (err) {
      console.log("MONITOR UPDATE DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json({ message: "Monitor updated successfully" });
  });
});

app.delete("/api/monitors/:id", (req, res) => {
  const id = req.params.id;
  const q = "DELETE FROM monitors WHERE Monitor_ID=?";
  db.query(q, [id], (err, data) => {
    if (err) {
      console.log("MONITOR DELETE DB ERROR:", err);
      return res.status(500).json({ message: "DB error"});
    } else if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    return res.json({ message: "Monitor deleted successfully" });
  })
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
        SELECT Monitor_ID, User_Email, Location, Status, Microprocessor_Type, Installation_Date
        FROM monitors
        WHERE Monitor_ID = ?
      `;
      const monitorsRows = await run(monitorsSql, [monitorId]);

      // energy_consumption
      const consumptionSql = `
        SELECT Consumption_ID, Monitor_ID, Timestamp, Consumption_Value
        FROM energy_consumption
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Timestamp BETWEEN ? AND ?" : ""}
        ORDER BY Timestamp DESC
        LIMIT ?
      `;
      const consumptionParams = hasRange ? [monitorId, from, to, rowLimit] : [monitorId, rowLimit];
      const consumptionRows = await run(consumptionSql, consumptionParams);

      // energy_production
      const productionSql = `
        SELECT Production_ID, Monitor_ID, Timestamp, Production_Value
        FROM energy_production
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Timestamp BETWEEN ? AND ?" : ""}
        ORDER BY Timestamp DESC
        LIMIT ?
      `;
      const productionParams = hasRange ? [monitorId, from, to, rowLimit] : [monitorId, rowLimit];
      const productionRows = await run(productionSql, productionParams);

      // environmental_data
      const envSql = `
        SELECT EnvData_ID, Monitor_ID, Timestamp, Light_Intensity, Temperature, Humidity
        FROM environmental_data
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Timestamp BETWEEN ? AND ?" : ""}
        ORDER BY Timestamp DESC
        LIMIT ?
      `;
      const envParams = hasRange ? [monitorId, from, to, rowLimit] : [monitorId, rowLimit];
      const envRows = await run(envSql, envParams);

      // energy_reserves
      const reservesSql = `
        SELECT EnergyReserves_ID, Monitor_ID, EnergyConsumption_ID, EnergyProduction_ID, Timestamp, Reserve_Amount
        FROM energy_reserves
        WHERE Monitor_ID = ?
        ${hasRange ? "AND Timestamp BETWEEN ? AND ?" : ""}
        ORDER BY Timestamp DESC
        LIMIT ?
      `;
      const reservesParams = hasRange ? [monitorId, from, to, rowLimit] : [monitorId, rowLimit];
      const reservesRows = await run(reservesSql, reservesParams);

      // notifications (note: in your schema notifications.Timestamp is int(11), not timestamp) :contentReference[oaicite:1]{index=1}
      const notificationsSql = `
        SELECT Notification_ID, Monitor_ID, EnergyConsumption_ID, EnergyProduction_ID, EnergyReserves_ID,
               EnvData_ID, SellRequest_ID, SolarData_ID, Timestamp, Notification_Type
        FROM notifications
        WHERE Monitor_ID = ?
        ORDER BY Notification_ID DESC
        LIMIT ?
      `;
      const notificationsRows = await run(notificationsSql, [monitorId, rowLimit]);

      // sell_request
      const sellSql = `
        SELECT Request_ID, Monitor_ID, EnergyReserves_ID, Energy_Amount, Request_Date, Status
        FROM sell_request
        WHERE Monitor_ID = ?
        ORDER BY Request_Date DESC
        LIMIT ?
      `;
      const sellRows = await run(sellSql, [monitorId, rowLimit]);

      // solar_system_data
      const solarSql = `
        SELECT SolarData_ID, Monitor_ID, EnergyProduction_ID, EnvData_ID,
               Theoretical_Panel_Production, Exact_Panel_Production, Panel_Efficiency, Total_Energy_Generated
        FROM solar_system_data
        WHERE Monitor_ID = ?
        ORDER BY SolarData_ID DESC
        LIMIT ?
      `;
      const solarRows = await run(solarSql, [monitorId, rowLimit]);

      return res.json({
        monitorId,
        monitors: monitorsRows,
        energy_consumption: consumptionRows,
        energy_production: productionRows,
        environmental_data: envRows,
        energy_reserves: reservesRows,
        notifications: notificationsRows,
        sell_request: sellRows,
        solar_system_data: solarRows,
      });
    } catch (err) {
      console.error("MONITOR DATA DB ERROR:", err);
      return res.status(500).json({ message: "DB error", error: err.sqlMessage });
    }
  })();
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
