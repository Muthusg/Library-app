// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const Book = require('./models/Book');
const User = require('./models/User');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// === Routes ===
app.use('/auth', authRoutes);

// 📚 Get all books (with user's issued status)
app.get('/books', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    const booksFromDb = await Book.find();

    const booksWithIssuedStatus = booksFromDb.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      issued: user.issuedBooks.includes(book.id)
    }));

    res.json(booksWithIssuedStatus);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Issue a book
app.put('/books/:id/issue', authMiddleware, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = await Book.findOne({ id: bookId });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const user = await User.findOne({ username: req.user.username });

    if (user.issuedBooks.includes(bookId)) {
      return res.status(400).json({ message: 'Book already issued by you' });
    }

    user.issuedBooks.push(bookId);
    await user.save();

    await Book.updateOne({ id: bookId }, { issued: true });
    res.json({ message: 'Book issued successfully' });
  } catch (err) {
    console.error('Error issuing book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Return a book
app.put('/books/:id/return', authMiddleware, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const user = await User.findOne({ username: req.user.username });

    if (!user.issuedBooks.includes(bookId)) {
      return res.status(400).json({ message: 'Book not issued by you' });
    }

    user.issuedBooks = user.issuedBooks.filter(id => id !== bookId);
    await user.save();

    await Book.updateOne({ id: bookId }, { issued: false });
    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    console.error('Error returning book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔗 MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mini_library_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
