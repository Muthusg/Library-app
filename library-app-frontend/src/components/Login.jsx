// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../styles/AuthForm.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const Login = ({ setToken, setUsername }) => {
  const [form, setForm] = useState({ identifier: "", password: "" }); // identifier = username or email
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", form);

      if (res?.data?.token && res?.data?.user) {
        const { token, user } = res.data;
        const { username, role } = user;

        // ✅ Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);

        setToken(token);
        setUsername(username);

        // ✅ Redirect based on role
        if (role === 'admin') {
          navigate("/adminpanel");
        } else {
          navigate("/");
        }

        toast.success("Login successful!");
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed. Try again.";
      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username or Email"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          required
        />
        <div className="password-group">
          <input
            type={showPassword ? "text" : "password"}
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
        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
