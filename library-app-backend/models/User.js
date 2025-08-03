const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  issuedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book' // Reference the Book model if needed
  }]
});

module.exports = mongoose.model("User", UserSchema);
