import api from "./api";

const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  // Google
  googleLogin: (data) => api.post("/auth/google-login", data),
  profile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export default authService;
