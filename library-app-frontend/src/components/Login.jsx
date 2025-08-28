import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../api";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Trim inputs to remove accidental spaces
      const trimmedIdentifier = identifier.trim();
      const trimmedPassword = password.trim();

      console.log("Sending login payload:", {
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });

      // Login API expects { identifier, password }
      const { data } = await API.post("/auth/login", {
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });

      // Check backend response
      if (!data.token || !data.user) {
        toast.error("Invalid response from server");
        setLoading(false);
        return;
      }

      // Store token and user info (including role) in AuthContext
      login(data.token, data.user);

      toast.success("Login successful!");

      // Redirect based on user role
      if (data.user.role === "admin") {
        navigate("/admin/Users");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username or Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username or Email
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-between text-sm text-blue-600">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="hover:underline"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="hover:underline"
            >
              New here? Register
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
