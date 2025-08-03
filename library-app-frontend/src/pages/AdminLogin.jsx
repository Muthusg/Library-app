// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api';
import '../styles/AuthForm.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function AdminLogin({ setToken }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post('/auth/adminlogin', form);
      const { token, user } = res.data;

      if (!user || user.role !== 'admin') {
        toast.error("Unauthorized access. Only admins can log in here.");
        return;
      }

      // ✅ Store token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (setToken) setToken(token);

      toast.success('Admin login successful');
      navigate('/adminpanel');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Admin Login</h2>

        <input
          type="text"
          placeholder="Admin Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />

        <div className="password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
