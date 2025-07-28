// src/pages/Library.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import API from '../api';

function Library() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 4;
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const fetchBooks = async () => {
    try {
      const res = await API.get('/books');
      setBooks(res.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    }
  };

  const issueBook = async (id) => {
    try {
      await API.put(`/books/${id}/issue`);
      toast.success('Book issued');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error issuing');
    }
  };

  const returnBook = async (id) => {
    try {
      await API.put(`/books/${id}/return`);
      toast.success('Book returned');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error returning');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    toast.success('Logged out');
    navigate('/login');
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

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const visibleBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  return (
    <>
      <Toaster position="top-center" />
      <div className="navbar">
        <h1>📚 Mini Library App</h1>
        <div className="user-info">
          <span>👤 {username}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
        </select>
      </div>

      <div className="book-list">
        {visibleBooks.map(book => (
          <div key={book.id} className="book-card">
            <img src={book.cover} alt={book.title} />
            <div className="book-title">{book.title}</div>
            <div className="book-author">by {book.author}</div>
            <div className={`status ${book.issued ? 'issued' : 'available'}`}>
              {book.issued ? 'Issued' : 'Available'}
            </div>
            {!book.issued ? (
              <button className="issue-button" onClick={() => issueBook(book.id)}>Issue</button>
            ) : (
              <button className="return-button" onClick={() => returnBook(book.id)}>Return</button>
            )}
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(p => p - 1)}>◀ Prev</button>
          )}
          <span>Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(p => p + 1)}>Next ▶</button>
          )}
        </div>
      )}
    </>
  );
}

export default Library;
