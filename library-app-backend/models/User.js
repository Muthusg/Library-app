// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, default: 'user' }, // Optional: 'user' or 'admin'
  issuedBooks: [{ type: Number }] // Book `id`s issued to the user
});

module.exports = mongoose.model('User', userSchema);
