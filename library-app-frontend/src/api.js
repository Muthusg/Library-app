import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL ||
           (process.env.NODE_ENV === "production"
             ? "https://library-app-jbyf.onrender.com"
             : "http://localhost:5000"),
});

// Attach token to requests if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
