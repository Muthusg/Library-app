import axios from 'axios';

const API = axios.create({
<<<<<<< HEAD
  baseURL: 'http://localhost:5000', // your backend port
});

// Attach token to every request if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
=======
  baseURL: 'http://localhost:5000',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
>>>>>>> cd491b411cbcf393b08d5ac860ffc55232e52e99
});

export default API;
