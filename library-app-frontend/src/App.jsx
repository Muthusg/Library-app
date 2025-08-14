import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Public pages/components
import Login from "./components/Login";
import Register from "./pages/Register";

// User pages/components
import Books from "./pages/Books";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import './index.css';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Admin pages
import UsersPage from "./pages/admin/Users";
import IssuedBooksPage from "./pages/admin/IssuedBooks";
import UpdateBooksPage from "./pages/admin/UpdateBooks";

// Layouts
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

// Auth protection
import ProtectedRoute from "./components/ProtectedRoute";

// Layout component wrapping Navbar and rendering child routes for users
function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Default redirect from "/" */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />


      {/* User protected routes wrapped inside Layout */}
      <Route
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin protected routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Default admin redirect */}
        <Route index element={<Navigate to="users" replace />} />

        <Route path="users" element={<UsersPage />} />
        <Route path="issued-books" element={<IssuedBooksPage />} />
        <Route path="update-books" element={<UpdateBooksPage />} />
      </Route>

      {/* Catch-all redirect to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
