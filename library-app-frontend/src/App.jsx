import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/books');
      setBooks(res.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    }
  };

  const issueBook = async (id) => {
    try {
      await axios.put(`http://localhost:5000/books/${id}/issue`);
      toast.success('Book issued successfully 📖');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error issuing book');
    }
  };

  const returnBook = async (id) => {
    try {
      await axios.put(`http://localhost:5000/books/${id}/return`);
      toast.success('Book returned successfully ✅');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error returning book');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'available' && !book.issued) ||
      (filter === 'issued' && book.issued);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <Toaster position="top-center" />
      <h1>📚 Mini Library App</h1>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px',
            width: '200px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '8px', marginLeft: '10px', borderRadius: '4px' }}
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
        </select>
      </div>

      <div className="book-list">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card">
            <img src={book.cover} alt={book.title} />
            <div className="book-title">{book.title}</div>
            <div className="book-author">by {book.author}</div>
            <div className={`status ${book.issued ? 'issued' : 'available'}`}>
              {book.issued ? 'Issued' : 'Available'}
            </div>
            {!book.issued && (
              <button className="issue-button" onClick={() => issueBook(book.id)}>Issue</button>
            )}
            {book.issued && (
              <button className="return-button" onClick={() => returnBook(book.id)}>Return</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
