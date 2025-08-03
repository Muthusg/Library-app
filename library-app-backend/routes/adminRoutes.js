const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ✅ Get all users (admin only, excluding passwords)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete a user (admin only)
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Add a new book (admin only)
router.post('/books', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, cover, copies } = req.body;

    if (!title || !author || !copies) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const book = new Book({
      title,
      author,
      totalCopies: copies,
      availableCopies: copies,
      cover: cover || ''
    });

    await book.save();

    res.status(201).json({ message: 'Book added successfully', book });
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Edit an existing book (admin only)
router.put('/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, cover, copies } = req.body;

    const updateData = {
      title,
      author,
      cover: cover || '',
      totalCopies: copies,
      availableCopies: copies // Optional: might require adjustment in real systems
    };

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });

    res.json({ message: 'Book updated successfully', book: updatedBook });
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Delete a book (admin only)
router.delete('/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
