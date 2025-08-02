const express = require('express');
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Secure this in .env

// ✅ Register Route (no changes)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      issuedBooks: []
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Updated Login Route (allows login via username OR email)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // now using "identifier"

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
=======
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
>>>>>>> cd491b411cbcf393b08d5ac860ffc55232e52e99
});

module.exports = router;
