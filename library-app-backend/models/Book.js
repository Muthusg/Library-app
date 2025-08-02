// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  author: String,
  issued: { type: Boolean, default: false },
  cover: String,
});

module.exports = mongoose.model('Book', bookSchema);
