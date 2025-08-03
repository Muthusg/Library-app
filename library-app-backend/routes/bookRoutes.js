const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;

// =================== REGISTER USER ===================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// =================== USER LOGIN ===================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// =================== GET AUTHENTICATED USER PROFILE ===================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
