require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const books = [
  {
    id: 1,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780061122415-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fiction',
  },
  {
    id: 2,
    title: 'Brave New World',
    author: 'Aldous Huxley',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/olid/OL2728714M-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Dystopian',
  },
  {
    id: 3,
    title: 'The Grapes of Wrath',
    author: 'John Steinbeck',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780143039433-M.jpg',  // Changed to ISBN cover
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Classic',
  },
  {
    id: 4,
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780141441146-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Romance',
  },
  {
    id: 5,
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780141439570-M.jpg', // Changed to ISBN cover
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Classic',
  },
  {
    id: 6,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    issued: false,
    cover: 'https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fantasy',
  },
  {
    id: 7,
    title: 'The Chronicles of Narnia',
    author: 'C.S. Lewis',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780064471190-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fantasy',
  },
  {
    id: 8,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780316769488-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fiction',
  },
  {
    id: 9,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Children',
  },
  {
    id: 10,
    title: 'Moby-Dick',
    author: 'Herman Melville',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780142437247-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Adventure',
  },
  {
    id: 11,
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/olid/OL23288550M-M.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Drama',
  },
  {
    id: 12,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    issued: false,
    cover: "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg",  // Changed to ISBN cover
    totalCopies: 5,
    issuedCopies: 0,
    category: "Non-fiction",
  },
];


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');

    await Book.deleteMany({});
    await Book.insertMany(books);

    console.log('✅ Books seeded successfully');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });

