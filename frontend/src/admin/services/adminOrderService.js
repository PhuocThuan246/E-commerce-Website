import api from "../../services/api";

const adminOrderService = {
  getAll: () => api.get("/admin/orders"),
  getCount: () => api.get("/admin/orders/count"),
  getById: (id) => api.get(`/admin/orders/${id}`),
};

export default adminOrderService;
