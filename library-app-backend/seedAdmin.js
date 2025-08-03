// seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      issuedBooks: []
    });

    await admin.save();
    console.log('✅ Admin user created');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
