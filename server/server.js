const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();

// Database setup (automatically creates 'database.db' file)
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Create users table (if it doesn't exist)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Test connection immediately
db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Database connected. Tables:", row);
});

app.use(express.json());

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        res.json({ success: true, userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({ success: true, user: { id: user.id, username: user.username } });
    }
  );
});

// Add this route to fetch all users
app.get('/users', (req, res) => {
  db.all("SELECT id, username, createdAt FROM users", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows); // Returns all users as JSON
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});