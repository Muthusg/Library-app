// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';

import Login from './components/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Library from './pages/Library';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin'; // ✅ Make sure this file exists

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // ✅ Add role state
  const [role, setRole] = useState(localStorage.getItem('role') || '');

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

  // ✅ Sync role to localStorage
  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role);
    }
  }, [role]);

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
        <Route path="/login" element={<Login setToken={setToken} setUsername={setUsername} />} />
        <Route path="/register" element={<Register />} />
        
        {/* ✅ Pass setRole and setUsername to AdminLogin */}
        <Route path="/adminlogin" element={<AdminLogin setToken={setToken} setRole={setRole} setUsername={setUsername} />} />

        {/* ✅ Pass role to AdminPanel */}
        <Route
          path="/adminpanel"
          element={
            <ProtectedRoute token={token}>
              <AdminPanel token={token} setToken={setToken} username={username} role={role} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={token ? '/' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
