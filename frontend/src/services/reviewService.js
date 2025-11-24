import api from "./api";

// ✅ Thống nhất endpoint đúng với backend của bạn
const reviewService = {
  // Lấy danh sách review / bình luận theo sản phẩm
  getByProduct: (productId) => api.get(`/products/${productId}`),

  // Gửi bình luận (không cần đăng nhập)
  addComment: (productId, data) =>
    api.post(`/products/${productId}/comments`, data),

  // Gửi đánh giá sao (cần đăng nhập)
  addRating: (productId, data, token) =>
    api.post(`/products/${productId}/ratings`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default reviewService;
