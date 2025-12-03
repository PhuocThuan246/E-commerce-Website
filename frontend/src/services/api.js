import axios from "axios";

// ==============================
// URL server backend
//   - Cấu hình trong .env:  VITE_API_URL=http://localhost:5000
//   - Nếu không có thì mặc định localhost:5000
// ==============================
export const SERVER_URL = "";
const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
});


// ==============================
// TỰ ĐỘNG GẮN TOKEN JWT (nếu có)
// ==============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
