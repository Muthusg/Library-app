import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username,
          role: decoded.role,
          email: decoded.email || "",
        });
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  // Accept user object explicitly for better control
  const login = (token, user) => {
    localStorage.setItem("token", token);
    setUser(user);

    if (user.role === "admin") {
      navigate("/admin/users");  // use lowercase to match your routes
    } else {
      navigate("/home");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
