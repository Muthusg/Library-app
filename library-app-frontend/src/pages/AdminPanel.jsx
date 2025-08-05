import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import '../styles/AdminPanel.css';
import BookFormModal from '../components/BookFormModal';

function AdminPanel({ token, setToken, username }) {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const role = currentUser?.role;

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
    }
  }, [role, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await API.get('/admin/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await API.delete(`/admin/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchBooks();
      } catch (err) {
        console.error('Failed to delete book:', err);
      }
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowBookModal(true);
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setShowBookModal(true);
  };

  const handleSaveBook = async (formData) => {
    try {
      if (editingBook && editingBook._id) {
        // Editing
        await API.put(`/admin/books/${editingBook._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Adding new
        await API.post(`/admin/books`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowBookModal(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      console.error('Failed to save book:', err);
    }
  };

  const handleModalClose = () => {
    setShowBookModal(false);
    setEditingBook(null);
  };

  useEffect(() => {
    fetchUsers();
    fetchBooks();
  }, []);

  return (
    <div className="admin-panel">
      <Navbar username={username} role={role} setToken={setToken} />
      <h2 className="panel-heading">Admin Panel</h2>

      <section className="admin-section">
        <h3>Users</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Issued Books</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.issuedBooks?.length || 0}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h3>Books</h3>
        <button className="btn-add" onClick={handleAddBook}>
          Add Book
        </button>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Copies</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.totalCopies || b.copies}</td>
                <td>{b.availableCopies}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditBook(b)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteBook(b._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showBookModal && (
        <BookFormModal
          token={token}
          initialData={editingBook}
          isOpen={showBookModal}
          onClose={handleModalClose}
          onSubmit={handleSaveBook} // ✅ added this
        />
      )}
    </div>
  );
}

export default AdminPanel;