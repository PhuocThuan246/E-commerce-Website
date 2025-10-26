import api from "../../services/api";

const adminUserService = {
  getAll: () => api.get("/admin/users"),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

export default adminUserService;
