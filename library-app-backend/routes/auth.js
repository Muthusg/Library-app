const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const JWT_SECRET = 'your-secret-key'; // You can move this to .env if needed

const USERS_FILE = path.join(__dirname, '../users.json');

const getUsers = () => {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// ✅ POST /auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { username, password, issuedBooks: [] };
  users.push(newUser);
  saveUsers(users);
  res.json({ message: 'User registered successfully' });
});

// ✅ POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
