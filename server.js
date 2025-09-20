const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'quiz_secret',
  resave: false,
  saveUninitialized: true
}));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'prem', // <-- your MySQL password
  database: 'quiz_app'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));

// Registration
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err) => {
    if (err) return res.send('<h1>User already exists</h1><p><a href="/register">Try again</a></p>');
    res.send('<h1>Registration successful</h1><p><a href="/">Login</a></p>');
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  db.query('SELECT * FROM users WHERE username = ? AND password = ? AND role = ?', [username, password, role], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      req.session.user = { username, role };
      if (role === 'admin') res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
      else res.sendFile(path.join(__dirname, 'views', 'student-dashboard.html'));
    } else {
      res.send('<h1>Invalid credentials</h1><p><a href="/">Try again</a></p>');
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
