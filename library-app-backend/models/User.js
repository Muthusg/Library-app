const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true, // ensures no two users have the same email
    lowercase: true,
    trim: true
  },
  password: String,
  role: String,
  issuedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book' // Reference the Book model
  }]
});

module.exports = mongoose.model("User", UserSchema);
