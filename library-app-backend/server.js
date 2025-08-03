const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const Book = require('./models/Book');
const User = require('./models/User');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ======================= MIDDLEWARES =======================
app.use(cors());
app.use(express.json());

// ======================= ROUTES =======================
app.get('/', (req, res) => {
  res.send('📚 Library Management System API is running');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/books', bookRoutes);

// ======================= USER BOOKS =======================
app.get('/books', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    const booksFromDb = await Book.find();

    const booksWithStatus = booksFromDb.map(book => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      availableCopies: book.availableCopies,
      issued: user.issuedBooks.some(id => id.toString() === book._id.toString()),
      status: book.availableCopies > 0 ? 'Available' : 'Unavailable',
    }));

    res.json(booksWithStatus);
  } catch (err) {
    console.error('❌ Error fetching books:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ======================= ADMIN BOOKS =======================
app.get('/admin/books', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error('❌ Error fetching admin books:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ======================= ISSUE A BOOK =======================
app.put('/books/:id/issue', verifyToken, async (req, res) => {
  try {
    const bookId = req.params.id;

    console.log('📘 Trying to issue book:', bookId);
    console.log('👤 Request user:', req.user);

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available' });
    }

    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyIssued = user.issuedBooks.some(id => id.toString() === bookId);
    if (alreadyIssued) {
      return res.status(400).json({ message: 'Book already issued by you' });
    }

    user.issuedBooks.push(book._id);
    await user.save();

    book.availableCopies -= 1;
    await book.save();

    res.json({ message: 'Book issued successfully' });
  } catch (err) {
    console.error('❌ Error issuing book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ======================= RETURN A BOOK =======================
app.put('/books/:id/return', verifyToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    const user = await User.findOne({ username: req.user.username });

    const hasBook = user.issuedBooks.some(id => id.toString() === bookId);
    if (!hasBook) {
      return res.status(400).json({ message: 'Book not issued by you' });
    }

    user.issuedBooks = user.issuedBooks.filter(id => id.toString() !== bookId);
    await user.save();

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found during return' });

    book.availableCopies += 1;
    await book.save();

    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    console.error('❌ Error returning book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ======================= MONGODB CONNECTION =======================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_library_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ======================= START SERVER =======================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
