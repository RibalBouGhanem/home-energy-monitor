import express from "express";
import cors from "cors";
import mysql from "mysql";

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

  const q = "SELECT email, isAdmin FROM users WHERE email = ? AND password = ? LIMIT 1";
  db.query(q, [email, password], (err, data) => {
    if (err) {
      console.log("LOGIN DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (data.length === 0) {
      console.log("INVALID CREDENTIALS:", email, err);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = data[0];

    return res.json({
        user: {
            email: user.email,
            isAdmin: user.isAdmin === 1,
    }});
  });
});

app.get("/api/users", (req, res) => {
  const q = "SELECT email, password, isAdmin FROM users";
  db.query(q, (err, data) => {
    if (err) {
      console.log("USERS DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json(data);
  });
});

app.post("/api/users", (req, res) => {
  const q = "INSERT INTO users (email, name, password, isAdmin, phoneNumber, monitorType, subscriptionType) VALUES (?, ?, ?, 0, ?, ?, ?)";
  const values = [
    req.body.email,
    req.body.name,
    req.body.password,
    req.body.phoneNumber,
    req.body.monitorType,
    req.body.subscriptionType
  ];
  db.query(q, values, (err, data) => {
    if (err) {
      console.log("USERS POST DB ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json({ message: "User created successfully" });
  });
});

app.delete("/users/:email", (req, res) => {
  const email = req.params.email;
  const q = "DELETE FROM users WHERE Email = ?";
  db.query(q, [email], (err, data) => {
    if (err) {
      console.log("USERS DELETE DB ERROR:", err);
      return res.status(500).json({ message: "DB error"});
    }
    return res.json({ message: "User deleted successfully" });
  })
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
