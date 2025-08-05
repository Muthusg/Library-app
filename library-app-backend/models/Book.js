const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  cover: { type: String }, // Base64 string
  totalCopies: { type: Number, required: true },
  availableCopies: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
