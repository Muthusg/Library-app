const express = require('express');
const router = express.Router();
const axios = require('axios');
const Book = require('../models/Book');
const User = require('../models/User');
const BookIssueHistory = require('../models/BookIssueHistory');

const { verifyToken } = require('../middleware/authMiddleware');

// Utility: Resolve final image URL
async function resolveFinalUrl(url) {
  if (!url) return '';
  try {
    const response = await axios.head(url, { maxRedirects: 5, validateStatus: null });
    return response.headers.location || url;
  } catch {
    return url;
  }
}

// ---------------------
// ADD NEW BOOK
// ---------------------
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, author, cover, category, totalCopies, description } = req.body;
    if (!title || !author || !totalCopies)
      return res.status(400).json({ message: 'Title, author and totalCopies are required' });

    const finalCover = await resolveFinalUrl(cover);

    const newBook = new Book({
      title,
      author,
      cover: finalCover,
      category: category || 'Uncategorized',
      totalCopies,
      issuedCopies: 0,
      description: description || '',
      isIssued: false,
      issuedBy: null,
      issuedDate: null,
      dueDate: null,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Add new book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// UPDATE BOOK
// ---------------------
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, author, cover, category, totalCopies, description } = req.body;
    if (!title || !author || !totalCopies)
      return res.status(400).json({ message: 'Title, author and totalCopies are required' });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.title = title;
    book.author = author;
    book.cover = await resolveFinalUrl(cover);
    book.category = category || 'Uncategorized';
    book.totalCopies = totalCopies;
    book.description = description || '';

    if (book.issuedCopies > totalCopies) {
      book.issuedCopies = totalCopies;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// GET ALL BOOKS
// ---------------------
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const books = await Book.find();

    const booksWithStatus = books.map(book => {
      const issuedByUser = user.issuedBooks.some(id => id.toString() === book._id.toString());
      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        category: book.category || 'Uncategorized',
        totalCopies: book.totalCopies,
        issuedCopies: book.issuedCopies,
        availableCopies: book.totalCopies - (book.issuedCopies || 0),
        issuedByUser,
        dueDate: issuedByUser ? book.dueDate : null,
      };
    });

    res.json(booksWithStatus);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// GET MY ISSUED BOOKS
// ---------------------
router.get('/mybooks', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('issuedBooks');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.issuedBooks);
  } catch (err) {
    console.error('Error fetching user issued books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// ISSUE BOOK
// ---------------------
router.post('/:id/issue', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('issuedBooks');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.issuedBooks.length >= 3)
      return res.status(400).json({ message: 'Book issue limit reached (max 3)' });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.issuedCopies >= book.totalCopies)
      return res.status(400).json({ message: 'No available copies for this book' });

    if (user.issuedBooks.some(b => b._id.toString() === req.params.id))
      return res.status(400).json({ message: 'You have already issued this book' });

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 7);

    // Update book
    book.issuedCopies += 1;
    book.isIssued = true;
    book.issuedBy = user._id;
    book.issuedDate = issueDate;
    book.dueDate = dueDate;
    await book.save();

    // Update user
    user.issuedBooks.push(book._id);
    await user.save();

    // Save history
    await BookIssueHistory.create({
      book: book._id,
      issuedBy: user._id,
      action: "issued",
      issuedDate: issueDate,
      dueDate
    });

    res.json({
      message: 'Book issued successfully',
      book,
      remainingBooks: 3 - user.issuedBooks.length,
    });
  } catch (err) {
    console.error('Issue book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// RETURN BOOK
// ---------------------
router.post('/:id/return', verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.issuedBooks.some(id => id.toString() === req.params.id))
      return res.status(400).json({ message: 'You have not issued this book' });

    // Update book
    book.issuedCopies = Math.max(book.issuedCopies - 1, 0);
    book.isIssued = book.issuedCopies > 0;
    if (book.issuedCopies === 0) {
      book.issuedBy = null;
      book.issuedDate = null;
      book.dueDate = null;
    }
    await book.save();

    // Update user
    user.issuedBooks = user.issuedBooks.filter(id => id.toString() !== req.params.id);
    await user.save();

    // Save history
    await BookIssueHistory.create({
      book: book._id,
      issuedBy: user._id,
      action: "returned",
      returnedDate: new Date()
    });

    res.json({
      message: 'Book returned successfully',
      book,
      remainingBooks: 3 - user.issuedBooks.length,
    });
  } catch (err) {
    console.error('Return book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------
// DELETE BOOK
// ---------------------
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });

    // Remove book from users' issuedBooks
    await User.updateMany({ issuedBooks: req.params.id }, { $pull: { issuedBooks: req.params.id } });

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
