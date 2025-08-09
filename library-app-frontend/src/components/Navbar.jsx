import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center text-xl font-bold cursor-pointer"
            onClick={() => navigate("/home")}
          >
            📚 My Library
          </div>

          {/* Menu Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/home" className="hover:text-yellow-400 transition">
              Home
            </Link>
            <Link to="/books" className="hover:text-yellow-400 transition">
              Books
            </Link>
            <Link to="/contact" className="hover:text-yellow-400 transition">
              Contact
            </Link>
            <Link to="/profile" className="hover:text-yellow-400 transition">
              Profile
            </Link>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
