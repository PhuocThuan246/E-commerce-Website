import api from "../../services/api"; // giữ nguyên instance axios

const adminProductService = {
  getAll: () => api.get("/admin/products"),
  create: (data) => api.post("/admin/products", data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),

    // Biến thể
  addVariant: (productId, data) =>
    api.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) =>
    api.put(`/admin/products/${productId}/variants/${variantId}`, data),
  removeVariant: (productId, variantId) =>
    api.delete(`/admin/products/${productId}/variants/${variantId}`),
};

export default adminProductService;
