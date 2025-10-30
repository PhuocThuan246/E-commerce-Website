import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_API_URL;
// Nhờ proxy nên chỉ cần baseURL = "/api"
const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

export default api;
