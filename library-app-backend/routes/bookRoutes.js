const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /books - Add a new book
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      author,
      cover,
      category,
      totalCopies,
      description,
    } = req.body;

    if (!title || !author || !totalCopies) {
      return res.status(400).json({ message: 'Title, author and totalCopies are required' });
    }

    const newBook = new Book({
      title,
      author,
      cover: cover || '',
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

// PUT /books/:id - Update an existing book by ID
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    const {
      title,
      author,
      cover,
      category,
      totalCopies,
      description,
    } = req.body;

    if (!title || !author || !totalCopies) {
      return res.status(400).json({ message: 'Title, author and totalCopies are required' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Update fields
    book.title = title;
    book.author = author;
    book.cover = cover || '';
    book.category = category || 'Uncategorized';
    book.totalCopies = totalCopies;
    book.description = description || '';

    // Adjust issuedCopies if needed (cannot exceed totalCopies)
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

// GET /books - List all books with user's issued status and availability info
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const books = await Book.find();

    const booksWithStatus = books.map(book => {
      const isIssuedByUser = user.issuedBooks.some(
        issuedBookId => issuedBookId.toString() === book._id.toString()
      );

      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        category: book.category || 'Uncategorized',
        totalCopies: book.totalCopies,
        issuedCopies: book.issuedCopies,
        availableCopies: book.totalCopies - (book.issuedCopies || 0),
        issuedByUser: isIssuedByUser,
        dueDate: isIssuedByUser ? book.dueDate : null,
      };
    });

    res.json(booksWithStatus);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /books/mybooks - List books issued by the logged-in user
router.get('/mybooks', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('issuedBooks');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.issuedBooks);
  } catch (err) {
    console.error('Error fetching user issued books:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /books/:id/issue - Issue a book to logged-in user
router.post('/:id/issue', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = req.params.id;

    const user = await User.findById(userId).populate('issuedBooks');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.issuedBooks.length >= 3) {
      return res.status(400).json({ message: 'Book issue limit reached (max 3)' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.issuedCopies >= book.totalCopies) {
      return res.status(400).json({ message: 'No available copies for this book' });
    }

    const alreadyIssued = user.issuedBooks.some(
      issuedBook => issuedBook._id.toString() === bookId
    );
    if (alreadyIssued) {
      return res.status(400).json({ message: 'You have already issued this book' });
    }

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 7); // 7 days due

    book.issuedCopies += 1;
    book.isIssued = book.issuedCopies > 0;
    book.issuedBy = userId;
    book.issuedDate = issueDate;
    book.dueDate = dueDate;
    await book.save();

    user.issuedBooks.push(book._id);
    await user.save();

    const remainingBooks = 3 - user.issuedBooks.length;

    res.json({
      message: 'Book issued successfully',
      book,
      remainingBooks,
    });
  } catch (err) {
    console.error('Issue book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /books/:id/return - Return a book
router.post('/:id/return', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.issuedBooks.some(id => id.toString() === bookId)) {
      return res.status(400).json({ message: 'You have not issued this book' });
    }

    book.issuedCopies = Math.max(book.issuedCopies - 1, 0);
    book.isIssued = book.issuedCopies > 0;

    if (book.issuedCopies === 0) {
      book.issuedBy = null;
      book.issuedDate = null;
      book.dueDate = null;
    }
    await book.save();

    user.issuedBooks = user.issuedBooks.filter(id => id.toString() !== bookId);
    await user.save();

    const remainingBooks = 3 - user.issuedBooks.length;

    res.json({
      message: 'Book returned successfully',
      book,
      remainingBooks,
    });
  } catch (err) {
    console.error('Return book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /books/:id - Delete a book by ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    const deletedBook = await Book.findByIdAndDelete(bookId);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });

    // Remove book from users' issuedBooks array
    await User.updateMany(
      { issuedBooks: bookId },
      { $pull: { issuedBooks: bookId } }
    );

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
