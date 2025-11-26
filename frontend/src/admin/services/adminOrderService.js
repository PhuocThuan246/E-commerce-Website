import api from "../../services/api";

const adminOrderService = {
  // params: { page, limit, filter, start, end }
  getAll: (params) => api.get("/admin/orders", { params }),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
  getCount: () => api.get("/admin/orders/count"),
};

export default adminOrderService;
