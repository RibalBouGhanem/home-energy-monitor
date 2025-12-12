import express from "express";
import cors from "cors";
import mysql from "mysql";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const dbConfigs = {
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

const db = mysql.createConnection();

db.connect((err) => {
  if (err) console.log("DB CONNECT ERROR:", err);
  else console.log("DB connected");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const q = "SELECT username, isAdmin FROM users WHERE username = ? AND password = ? LIMIT 1";
  db.query(q, [username, password], (err, data) => {
    if (err) {
      console.log("LOGIN DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (data.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = data[0];

    return res.json({
        user: {
            username: user.username,
            isAdmin: user.isAdmin === 1,
    }});
  });
});

app.get("/api/users", (req, res) => {
  const q = "SELECT username, isAdmin FROM users";
  db.query(q, (err, data) => {
    if (err) {
      console.log("USERS DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json(data);
  });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
