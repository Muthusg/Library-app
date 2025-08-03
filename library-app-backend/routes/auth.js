const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ✅ Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser)
      return res.status(400).json({ message: 'Username or Email already exists' });

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

// ✅ Unified Login (works for both admin & user)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ message: 'Identifier and password are required' });

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🟡 Optional: Dedicated Admin Login
router.post('/adminlogin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required' });

    const admin = await User.findOne({ username });

    if (!admin || admin.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: Not an admin' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
