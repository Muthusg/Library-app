const mongoose = require('mongoose');

const BookIssueHistorySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['issued', 'returned'],
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  returnedDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('BookIssueHistory', BookIssueHistorySchema);
