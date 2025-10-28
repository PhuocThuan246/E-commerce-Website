import api from "../../services/api";


const adminUserService = {
  getAll: () => api.get("/admin/users"),
  update: (id, data) => api.patch(`/admin/users/${id}`, data),
  ban: (id) => api.patch(`/admin/users/${id}/ban`),
  unban: (id) => api.patch(`/admin/users/${id}/unban`),
};

export default adminUserService;

