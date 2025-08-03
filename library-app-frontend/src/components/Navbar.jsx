import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ username, role, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    if (setToken) setToken(null);
    navigate('/login');
  };

  // Prefer passed props over localStorage
  const displayUsername = username || localStorage.getItem('username') || 'Guest';
  const userRole = role || localStorage.getItem('role') || 'user';

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <h2 className="navbar-title">📚 Mini Library App</h2>
      </div>

      <div className="navbar-right">
        <span className="user-info">
          <strong>{displayUsername}</strong> ({userRole === 'admin' ? 'Admin' : 'User'})
        </span>

        {userRole === 'admin' && (
          <button className="navbar-button" onClick={() => navigate('/adminpanel')}>
            Admin Panel
          </button>
        )}
        <button className="navbar-button logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
