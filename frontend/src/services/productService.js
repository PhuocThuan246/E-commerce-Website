import api from "./api";

const productService = {
  getAll: () => api.get("/products"),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getById: (id) => api.get(`/products/detail/${id}`),
  updateStock: (productId, variantId, quantity) =>
    api.put("/products/update-stock", { productId, variantId, quantity }),
};

export default productService;
