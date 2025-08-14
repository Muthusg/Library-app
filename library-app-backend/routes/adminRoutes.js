const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const BookIssueHistory = require("../models/BookIssueHistory");
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Helper: cleanup issued books on user delete
async function cleanupIssuedBooks(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  for (const issued of user.issuedBooks) {
    const book = await Book.findById(issued.bookId);
    if (book) {
      book.issuedCopies = Math.max(book.issuedCopies - 1, 0);
      await book.save();
    }
  }
}

// --- Users ---
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('issuedBooks.bookId');
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

// --- Books ---
router.post('/books', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, cover, totalCopies, category, description } = req.body;
    if (!title || !author || !totalCopies) {
      return res.status(400).json({ message: 'Title, author, totalCopies required' });
    }
    const book = new Book({
      title,
      author,
      cover: cover || '',
      category: category || 'Uncategorized',
      totalCopies,
      issuedCopies: 0,
      description: description || ''
    });
    await book.save();
    res.status(201).json({ message: 'Book added', book });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, cover, totalCopies, category, description } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (totalCopies < book.issuedCopies) {
      return res.status(400).json({ message: `Total copies cannot be less than currently issued copies (${book.issuedCopies})` });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.cover = cover || book.cover;
    book.category = category || book.category;
    book.description = description || book.description;
    book.totalCopies = totalCopies;

    await book.save();
    res.json({ message: 'Book updated', book });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookId = req.params.id;
    await User.updateMany(
      { "issuedBooks.bookId": bookId },
      { $pull: { issuedBooks: { bookId: bookId } } }
    );
    const deletedBook = await Book.findByIdAndDelete(bookId);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Issue Book ---
router.post('/issue-book', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: 'UserId and BookId required' });

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });

    if (book.issuedCopies >= book.totalCopies) return res.status(400).json({ message: 'No copies available' });
    if (user.issuedBooks.length >= 3) return res.status(400).json({ message: 'User has reached 3 book limit' });
    if (user.issuedBooks.some(b => b.bookId.toString() === bookId)) return res.status(400).json({ message: 'Book already issued to this user' });

    const issuedDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issuedDate.getDate() + 7);

    // Update user & book
    user.issuedBooks.push({ bookId, issuedDate, dueDate });
    book.issuedCopies += 1;
    await user.save();
    await book.save();

    // Save history
    await BookIssueHistory.create({ book: book._id, issuedBy: user._id, issuedDate, returnedDate: null });

    res.json({ message: 'Book issued successfully', issuedDate, dueDate, remainingQuota: 3 - user.issuedBooks.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- Return Book ---
router.post('/return-book', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: 'UserId and BookId required' });

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });

    const issuedIndex = user.issuedBooks.findIndex(b => b.bookId.toString() === bookId);
    if (issuedIndex === -1) return res.status(400).json({ message: 'Book not issued to user' });

    user.issuedBooks.splice(issuedIndex, 1);
    book.issuedCopies = Math.max(book.issuedCopies - 1, 0);
    await user.save();
    await book.save();

    // Update history
    await BookIssueHistory.findOneAndUpdate(
      { book: book._id, issuedBy: user._id, returnedDate: null },
      { returnedDate: new Date() }
    );

    res.json({ message: 'Book returned successfully', remainingQuota: 3 - user.issuedBooks.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- Issue History ---
router.get("/issue-history", verifyToken, isAdmin, async (req, res) => {
  try {
    const history = await BookIssueHistory.find()
      .populate("book", "title author cover category")
      .populate("issuedBy", "username email")
      .sort({ issuedDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issue history", error });
  }
});

// --- Clear Issue History ---
router.delete("/issue-history/clear", verifyToken, isAdmin, async (req, res) => {
  try {
    await BookIssueHistory.deleteMany({});
    res.json({ message: "Issue history cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear issue history", error });
  }
});

module.exports = router;
