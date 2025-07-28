// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Library from './pages/Library';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // Sync token to localStorage if changed
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    }
  }, [username]);

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
              <Library token={token} username={username} setToken={setToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={<Login setToken={setToken} setUsername={setUsername} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
