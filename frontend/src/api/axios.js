import axios from "axios";

// Base Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // adjust backend URL
});

// Attach JWT to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // token from login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
