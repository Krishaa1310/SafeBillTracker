require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Initialize SQLite DB
const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
    
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_reminders_enabled INTEGER DEFAULT 0
    )`);

    // Create reminders table
    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      dueDate TEXT NOT NULL,
      category TEXT,
      frequency TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const sql = `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, passwordHash], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      
      const user = { id: this.lastID, name, email };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ user, token });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Auth: Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, row.password_hash);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    const user = { id: row.id, name: row.name, email: row.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  });
});

// Auth: Get Me (and preferences)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  db.get(`SELECT id, name, email, email_reminders_enabled FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json(row);
  });
});

// Auth: Update Preferences
app.put("/api/auth/preferences", authenticateToken, (req, res) => {
  const { email_reminders_enabled } = req.body;
  
  db.run(`UPDATE users SET email_reminders_enabled = ? WHERE id = ?`, 
    [email_reminders_enabled ? 1 : 0, req.user.id], 
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Preferences updated", email_reminders_enabled: !!email_reminders_enabled });
  });
});

// Auth: Update Profile
app.put("/api/auth/profile", authenticateToken, (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  db.run(`UPDATE users SET name = ? WHERE id = ?`, [name.trim(), req.user.id], function(err) {
    if (err) return res.status(500).json({ error: "Database error" });
    
    // Fetch updated user
    db.get(`SELECT id, name, email, email_reminders_enabled FROM users WHERE id = ?`, [req.user.id], (err, row) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Profile updated", user: row });
    });
  });
});

// Reminders: Get all for user
app.get("/api/reminders", authenticateToken, (req, res) => {
  db.all(`SELECT * FROM reminders WHERE user_id = ? ORDER BY dueDate ASC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

// Reminders: Create
app.post("/api/reminders", authenticateToken, (req, res) => {
  const { id, title, amount, dueDate, category, frequency, notes, status, createdAt } = req.body;
  
  const sql = `INSERT INTO reminders (id, user_id, title, amount, dueDate, category, frequency, notes, status, createdAt) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [id, req.user.id, title, amount, dueDate, category, frequency, notes, status, createdAt], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({ message: "Reminder created", id });
  });
});

// Reminders: Update status (Complete)
app.put("/api/reminders/:id", authenticateToken, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE reminders SET status = ? WHERE id = ? AND user_id = ?`, [status, req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Reminder not found" });
    res.json({ message: "Reminder updated" });
  });
});

// Reminders: Delete
app.delete("/api/reminders/:id", authenticateToken, (req, res) => {
  db.run(`DELETE FROM reminders WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
