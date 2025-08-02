<<<<<<< HEAD
// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const Book = require('./models/Book');
const User = require('./models/User');
=======
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const fs = require('fs');
const path = require('path');
>>>>>>> cd491b411cbcf393b08d5ac860ffc55232e52e99

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
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
=======
let books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg' },
  { id: 2, title: '1984', author: 'George Orwell', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg' },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg' },
  { id: 5, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
  { id: 6, title: 'The Hobbit', author: 'J.R.R. Tolkien', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780261103344-L.jpg' },
  { id: 7, title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg' },
  { id: 8, title: 'The Catcher in the Rye', author: 'J.D. Salinger', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg' },
  { id: 9, title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg' },
  { id: 10, title: 'Moby-Dick', author: 'Herman Melville', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg' },
  { id: 11, title: 'The Kite Runner', author: 'Khaled Hosseini', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg' },
  { id: 12, title: 'The Book Thief', author: 'Markus Zusak', issued: false, cover: 'https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg' },
];


const getUsers = () => {
  const data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
};

app.use('/auth', authRoutes);

// 🔐 Protect the routes below
app.get('/books', authMiddleware, (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.username === req.user.username);
  const booksWithIssuedStatus = books.map(book => ({
    ...book,
    issued: user.issuedBooks.includes(book.id)
  }));
  res.json(booksWithIssuedStatus);
});

app.put('/books/:id/issue', authMiddleware, (req, res) => {
  const bookId = parseInt(req.params.id);
  const users = getUsers();
  const user = users.find(u => u.username === req.user.username);

  if (!books.find(b => b.id === bookId)) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (user.issuedBooks.includes(bookId)) {
    return res.status(400).json({ message: 'Book already issued by you' });
  }

  user.issuedBooks.push(bookId);
  saveUsers(users);
  res.json({ message: 'Book issued successfully' });
});

app.put('/books/:id/return', authMiddleware, (req, res) => {
  const bookId = parseInt(req.params.id);
  const users = getUsers();
  const user = users.find(u => u.username === req.user.username);

  if (!user.issuedBooks.includes(bookId)) {
    return res.status(400).json({ message: 'Book not issued by you' });
  }

  user.issuedBooks = user.issuedBooks.filter(id => id !== bookId);
  saveUsers(users);
  res.json({ message: 'Book returned successfully' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
>>>>>>> cd491b411cbcf393b08d5ac860ffc55232e52e99
