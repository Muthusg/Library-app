const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

async function cleanupIssuedBooks(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  for (const bookId of user.issuedBooks) {
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
  }
}

router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('issuedBooks');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await cleanupIssuedBooks(userId);
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/issued-books', verifyToken, isAdmin, async (req, res) => {
  try {
    const usersWithIssuedBooks = await User.find({ issuedBooks: { $exists: true, $ne: [] } })
      .select('username email issuedBooks')
      .populate({
        path: 'issuedBooks',
        select: 'title author category totalCopies availableCopies',
      });
    res.json(usersWithIssuedBooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/books', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, cover, totalCopies, category } = req.body;
    if (!title || !author || !totalCopies || !category) return res.status(400).json({ message: 'Missing fields' });
    const book = new Book({ title, author, cover: cover || '', totalCopies, availableCopies: totalCopies, category });
    await book.save();
    res.status(201).json({ message: 'Book added', book });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, cover, totalCopies, category } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const issuedCount = book.totalCopies - book.availableCopies;
    if (totalCopies < issuedCount) return res.status(400).json({ message: `Total copies cannot be less than issued count (${issuedCount})` });

    book.title = title || book.title;
    book.author = author || book.author;
    book.cover = cover || book.cover;
    book.category = category || book.category;
    const delta = totalCopies - book.totalCopies;
    book.totalCopies = totalCopies;
    book.availableCopies += delta;

    await book.save();
    res.json({ message: 'Book updated', book });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookId = req.params.id;
    const deletedBook = await Book.findByIdAndDelete(bookId);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    await User.updateMany({ issuedBooks: bookId }, { $pull: { issuedBooks: bookId } });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/issue-book', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: 'UserId and BookId required' });

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });
    if (book.availableCopies < 1) return res.status(400).json({ message: 'No copies available' });
    if (user.issuedBooks.includes(bookId)) return res.status(400).json({ message: 'Book already issued' });

    book.availableCopies -= 1;
    user.issuedBooks.push(bookId);
    await book.save();
    await user.save();

    res.json({ message: 'Book issued successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/return-book', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: 'UserId and BookId required' });

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });

    if (!user.issuedBooks.includes(bookId)) return res.status(400).json({ message: 'Book not issued to user' });

    book.availableCopies += 1;
    user.issuedBooks = user.issuedBooks.filter(id => id.toString() !== bookId);
    await book.save();
    await user.save();

    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
