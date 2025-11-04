import api from "./api";

const productService = {
  // 📦 Lấy toàn bộ sản phẩm (HomePage)
  getAll: (query = "") => api.get(`/products${query}`),

  // 📦 Lấy sản phẩm theo danh mục cụ thể (CategoryTabs)
  getByCategory: (categoryId) =>
    api.get(`/products/category/${categoryId}`),

  // 🔍 Lấy chi tiết sản phẩm (ProductDetail)
  getById: (id) => api.get(`/products/detail/${id}`),

  // 🧮 Cập nhật tồn kho (checkout / admin)
  updateStock: (productId, variantId, quantity) =>
    api.put("/products/update-stock", { productId, variantId, quantity }),

  // ✨ Sản phẩm mới nhất (hiển thị ở trang chủ)
  getNew: (limit = 12) => api.get(`/products/new?limit=${limit}`),

  // 🔥 Sản phẩm bán chạy nhất (hiển thị ở trang chủ)
  getBestSellers: (limit = 12) =>
    api.get(`/products/best-sellers?limit=${limit}`),

  // 🛒 Danh mục sản phẩm có phân trang + sắp xếp (cũ, vẫn giữ)
  // 🛒 Danh mục sản phẩm có phân trang + sắp xếp + lọc + tìm kiếm (chuẩn homepage)
  getCatalog: ({
    page = 1,
    limit = 10,
    sort = "default",
    search = "",
    brand = "",
    minPrice = "",
    maxPrice = "",
    rating = "",
  } = {}) => {
    return api.get("/products/search", {
      params: { page, limit, sort, search, brand, minPrice, maxPrice, rating },
    });
  },


  // ============================
  // 🔍 TÌM KIẾM & LỌC (MỚI)
  // ============================

  // ✅ API: /api/products/search
  // Hỗ trợ các tham số:
  // q, brand, minPrice, maxPrice, minRating, sort, page, limit
  searchProducts: (params = {}) =>
    api.get("/products/search", { params }),

  // ✅ API: /api/products/filter-meta
  // Lấy danh sách brand + giá min/max (build UI bộ lọc)
  getFilterMeta: () => api.get("/products/filter-meta"),
};

export default productService;
