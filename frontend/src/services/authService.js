import api from "./api";

const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  profile: (token) =>
    api.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default authService;
