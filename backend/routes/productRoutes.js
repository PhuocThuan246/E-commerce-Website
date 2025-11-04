// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect: auth } = require("../middlewares/authMiddleware");

const {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateVariantStock,
  getNewProducts,
  getBestSellers,
  getCatalogProducts,
  getFilterMeta,
  getBrandsByCategory, // ✅ thêm controller brand
  addComment,          // ✅ mới
  addRating,           // ✅ mới
} = require("../controllers/productController");

// ==============================
// 🔍 API TÌM KIẾM & LỌC SẢN PHẨM (AJAX Catalog)
// ==============================
// ✅ Cho phép người dùng tìm kiếm theo từ khóa + lọc theo brand, giá, rating
router.get("/catalog", getCatalogProducts);

// ✅ API phụ để lấy danh sách thương hiệu + giá min/max cho filter UI
router.get("/filter-meta", getFilterMeta);

// ✅ API lấy danh sách thương hiệu theo danh mục (hover sidebar)
router.get("/brands/:categoryId", getBrandsByCategory);

// ==============================
// 💬 Bình luận & ⭐ Đánh giá (realtime)
// ==============================
// Không cần đăng nhập để bình luận
router.post("/:id/comments", addComment);

// Bắt buộc đăng nhập để đánh giá sao
router.post("/:id/ratings", auth, addRating);

// ==============================
// 📦 Danh mục sản phẩm (phân trang & sắp xếp cơ bản)
// ==============================
router.get("/catalog-basic", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Chốt whitelist sort để tránh giá trị lạ
    const ALLOWED_SORTS = new Set([
      "default",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
    ]);
    const sortBy = ALLOWED_SORTS.has(req.query.sort)
      ? req.query.sort
      : "default";

    let sortOption = {};
    switch (sortBy) {
      case "price_asc":
        sortOption = { effectivePrice: 1 };
        break;
      case "price_desc":
        sortOption = { effectivePrice: -1 };
        break;
      case "name_asc":
        sortOption = { name: 1 };
        break;
      case "name_desc":
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments();

    const products = await Product.find()
      .populate("category", "name")
      .collation({
        locale: "vi",
        strength: 1,
        caseLevel: false,
        numericOrdering: true,
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("name image description category effectivePrice");

    const pages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      data: products.map((p) => ({
        _id: p._id,
        name: p.name,
        category: p.category?.name || "",
        description: p.description,
        image: p.image,
        price: p.effectivePrice,
      })),
      pagination: { total, page, pages, limit },
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==============================
// 💬 (giữ nguyên route cũ nếu FE đang dùng)
// ==============================
router.post("/:id/reviews", async (req, res) => {
  try {
    const { name, comment, rating } = req.body;

    if (!comment || !rating) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập bình luận và chọn số sao!" });
    }

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const newReview = {
      name: name?.trim() || "Khách hàng ẩn danh",
      comment: comment.trim(),
      rating: Number(rating),
    };

    product.reviews.push(newReview);

    const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratingAverage = (total / product.reviews.length).toFixed(1);

    await product.save();

    // phát realtime cho tương thích
    const io = req.app.get("io");
    io.emit("review:new", { productId: req.params.id, review: newReview });

    res.json({
      message: "Đã thêm đánh giá!",
      reviews: product.reviews.reverse(),
      ratingAverage: product.ratingAverage,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm đánh giá:", err);
    res.status(500).json({ message: "Lỗi server khi thêm đánh giá" });
  }
});

// ==============================
// ⭐ Lấy danh sách đánh giá
// ==============================
router.get("/:id/reviews", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select(
      "reviews ratingAverage"
    );
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json({
      reviews: product.reviews.reverse(),
      ratingAverage: product.ratingAverage || 0,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy đánh giá:", err);
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá" });
  }
});

// ==============================
// 🧩 Các route cũ vẫn giữ nguyên
// ==============================
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/detail/:id", getProductById);
router.put("/update-stock", updateVariantStock);
router.get("/new", getNewProducts);
router.get("/best-sellers", getBestSellers);

module.exports = router;
