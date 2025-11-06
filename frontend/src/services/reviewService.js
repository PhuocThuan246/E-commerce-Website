import api from "./api";

const reviewService = {
  getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};

export default reviewService;
