require("dotenv").config();
process.on("uncaughtException", (err) => {
  console.error("=================================");
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
  console.error("=================================");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("=================================");
  console.error("UNHANDLED REJECTION");
  console.error(reason);
  console.error("=================================");
});
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

let transporter;

async function setupTransporter() {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("Server Nodemailer transporter ready. Using configured SMTP.");
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Server Nodemailer transporter ready. Using Ethereal E-mail for Password Resets.");
    } catch (error) {
      console.error("Error creating ethereal account", error);
    }
  }
}

setupTransporter();

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

    // Create password resets table
    db.run(`CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
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

// Auth: Forgot Password
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = Date.now() + 3600000; // 1 hour from now

    db.run(`INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)`, 
      [user.id, tokenHash, expiresAt], 
      function (err) {
        if (err) return res.status(500).json({ error: "Database error" });
        
        const resetLink = `http://localhost:5173/#/reset-password?token=${resetToken}`;
        
        if (transporter) {
          const mailOptions = {
            from: '"Smart Bill Tracker Support" <support@smartbilltracker.com>',
            to: email,
            subject: "Password Reset Request",
            text: `Hello,\n\nYou requested a password reset. Click the link below to securely reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
            html: `<p>Hello,</p>
                   <p>You requested a password reset. Click the link below to securely reset your password:</p>
                   <a href="${resetLink}">Reset Password Here</a>
                   <p>If you did not request this, please ignore this email.</p>`
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending reset email:", error);
            } else {
              console.log("=========================================");
              console.log("PASSWORD RESET ETHEREAL EMAIL DISPATCHED!");
              console.log(`Click this URL to view the email in browser: ${nodemailer.getTestMessageUrl(info)}`);
              console.log("=========================================");
            }
          });
        }

        res.json({ message: "If that email exists, a reset link has been sent." });
      });
  });
});

// Auth: Reset Password
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

  const now = Date.now();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  db.get(`SELECT * FROM password_resets WHERE token = ? AND expires_at > ?`, [tokenHash, now], async (err, resetRecord) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!resetRecord) return res.status(400).json({ error: "Invalid or expired token" });

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, resetRecord.user_id], function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        
        // Delete the used token
        db.run(`DELETE FROM password_resets WHERE id = ?`, [resetRecord.id]);
        
        res.json({ message: "Password has been successfully reset" });
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
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

// Import the cron scheduler so it runs in the background
//require("./cron.js");
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
