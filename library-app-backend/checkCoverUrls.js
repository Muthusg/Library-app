// checkCoverUrls.js
require('dotenv').config();

const mongoose = require("mongoose");
const fetch = require("node-fetch"); // run: npm install node-fetch@2

// ==== MongoDB connection ====
mongoose.connect(process.env.MONGO_URI);


const bookSchema = new mongoose.Schema({
  title: String,
  cover: String
});
const Book = mongoose.model("Book", bookSchema);

// ==== Function to check URL ====
async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok; // true if status is 200-299
  } catch (err) {
    return false;
  }
}

// ==== Main ====
(async () => {
  const books = await Book.find({});
  for (let book of books) {
    const valid = await checkUrl(book.cover);
    console.log(`${book.title} → ${valid ? "✅ Valid" : "❌ Broken"}`);
  }
  mongoose.connection.close();
})();
