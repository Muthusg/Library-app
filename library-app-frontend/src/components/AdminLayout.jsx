// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-blue-700">
          📚 Admin Panel
        </div>
        <nav className="flex flex-col flex-1 p-4 space-y-2">
          <Link
            to="/admin/users"
            className="hover:bg-blue-700 p-2 rounded transition"
          >
            Users
          </Link>
          <Link
            to="/admin/issued-books"
            className="hover:bg-blue-700 p-2 rounded transition"
          >
            Issued Books
          </Link>
          <Link
            to="/admin/update-books"
            className="hover:bg-blue-700 p-2 rounded transition"
          >
            Update Books
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, Admin</h1>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
