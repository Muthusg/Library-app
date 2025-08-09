require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const books = [
  {
    id: 1,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fiction',
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Dystopian',
  },
  {
    id: 3,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Classic',
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Romance',
  },
  {
    id: 5,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Classic',
  },
  {
    id: 6,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780261103344-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fantasy',
  },
  {
    id: 7,
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fantasy',
  },
  {
    id: 8,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Fiction',
  },
  {
    id: 9,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Children',
  },
  {
    id: 10,
    title: 'Moby-Dick',
    author: 'Herman Melville',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Adventure',
  },
  {
    id: 11,
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Drama',
  },
  {
    id: 12,
    title: 'The Book Thief',
    author: 'Markus Zusak',
    issued: false,
    cover: 'https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg',
    totalCopies: 5,
    issuedCopies: 0,
    category: 'Historical',
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

