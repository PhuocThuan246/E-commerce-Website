import api from "./api";

const productService = {
  // ===============================
  // 📦 Lấy tất cả sản phẩm (dành cho trang chủ / admin)
  // ===============================
  getAll: () => api.get("/products"),

  // ===============================
  // 🔍 Lấy danh sách sản phẩm theo danh mục
  // ===============================
  getByCategory: (categoryId) =>
    api.get(`/products/category/${categoryId}`),

  // ===============================
  // 🔎 Lấy chi tiết sản phẩm
  // ===============================
  getById: (id) => api.get(`/products/detail/${id}`),

  // ===============================
  // 🧮 Lấy sản phẩm mới nhất
  // ===============================
  getNew: (limit = 12) => api.get(`/products/new?limit=${limit}`),

  // ===============================
  // 🔥 Lấy sản phẩm bán chạy
  // ===============================
  getBestSellers: (limit = 12) =>
    api.get(`/products/best-sellers?limit=${limit}`),

  // ===============================
  // 🎯 Lọc sản phẩm (Catalog)
  // Hỗ trợ: tìm kiếm, thương hiệu, giá, rating, sắp xếp, phân trang
  // ===============================
  getCatalog: (params = {}) => {
    const {
      search = "",
      brand = "",
      minPrice = "",
      maxPrice = "",
      rating = "",
      sort = "default",
      page = 1,
      limit = 12,
    } = params;

    // Build query string động
    const query = new URLSearchParams();

    if (search) query.append("search", search);
    if (brand) query.append("brand", brand);
    if (minPrice) query.append("minPrice", minPrice);
    if (maxPrice) query.append("maxPrice", maxPrice);
    if (rating) query.append("rating", rating);
    if (sort) query.append("sort", sort);
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);

    return api.get(`/products/catalog?${query.toString()}`);
  },

  // ===============================
  // 📊 Lấy meta dữ liệu lọc (thương hiệu, min/max giá)
  // ===============================
  getFilterMeta: () => api.get("/products/filter-meta"),

  // ===============================
  // 💬 Lấy danh sách đánh giá sản phẩm
  // ===============================
  getReviews: (id) => api.get(`/products/${id}/reviews`),
};

export default productService;
