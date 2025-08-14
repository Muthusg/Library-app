const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  cover: { type: String },

  totalCopies: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Total copies must be at least 1']
  },
  issuedCopies: { type: Number, default: 0 },
  isIssued: { type: Boolean, default: false },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedDate: Date,
  dueDate: Date,
  description: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Fiction",
      "Classic",
      "Romance",
      "Dystopian",
      "Fantasy",
      "Adventure",
      "Children",
      "Drama",
      "Historical",
      "Non-fiction"  
    ],
    default: "Fiction"
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
