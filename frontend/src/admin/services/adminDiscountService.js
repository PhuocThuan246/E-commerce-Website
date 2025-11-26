import api from "../../services/api";

const adminDiscountService = {
  getAll: () => api.get("/admin/discounts"),
  getById: (id) => api.get(`/admin/discounts/${id}`),
  create: (payload) => api.post("/admin/discounts", payload),
};

export default adminDiscountService;
