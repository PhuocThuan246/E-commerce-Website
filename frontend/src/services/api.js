import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

// ✅ TỰ ĐỘNG GẮN TOKEN JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
