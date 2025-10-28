import api from "./api";

const productService = {
  getAll: () => api.get("/products"),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getById: (id) => api.get(`/products/detail/${id}`),
  updateStock: (productId, variantId, quantity) =>
    api.put("/products/update-stock", { productId, variantId, quantity }),

  getNew: (limit = 12) => api.get(`/products/new?limit=${limit}`),
  getBestSellers: (limit = 12) => api.get(`/products/best-sellers?limit=${limit}`),
};

export default productService;
