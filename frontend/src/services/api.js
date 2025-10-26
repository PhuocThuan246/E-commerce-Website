import axios from "axios";

// Nhờ proxy nên chỉ cần baseURL = "/api"
const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

export default api;
