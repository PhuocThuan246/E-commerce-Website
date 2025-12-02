const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// ================================
// Lấy danh sách sản phẩm (Catalog) - hỗ trợ tìm kiếm & lọc AJAX
// ================================
const getCatalogProducts = async (req, res) => {
  try {
    const {
      search = "",
      brand = "",
      minPrice = "",
      maxPrice = "",
      rating = "",
      sort = "default",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(60, Math.max(1, parseInt(limit)));
    const query = {};

    // Tìm kiếm theo tên hoặc mô tả
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Lọc theo thương hiệu
    if (brand) {
      const brands = brand.split(",").map((b) => b.trim()).filter(Boolean);
      if (brands.length) query.brand = { $in: brands };
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      query.effectivePrice = {};
      if (!isNaN(minPrice) && minPrice !== "")
        query.effectivePrice.$gte = Number(minPrice);
      if (!isNaN(maxPrice) && maxPrice !== "")
        query.effectivePrice.$lte = Number(maxPrice);
    }

    // Lọc theo xếp hạng
    if (rating && !isNaN(rating)) {
      query.ratingAverage = { $gte: Number(rating) };
    }

    // Sắp xếp
    let sortOption = {};
    switch (sort) {
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
      case "rating_desc":
        sortOption = { ratingAverage: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Truy vấn dữ liệu
    const [items, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .collation({
          locale: "vi",
          strength: 1,
          caseLevel: false,
          numericOrdering: true,
        })
        .sort(sortOption)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .select("name images brand effectivePrice ratingAverage category"),
      Product.countDocuments(query),
    ]);

    res.json({
      data: items,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Lỗi khi lọc sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi lọc sản phẩm" });
  }
};

// ================================
// API lấy danh sách brand + khoảng giá (min/max)
// ================================
const getFilterMeta = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          brands: { $addToSet: "$brand" },
          minPrice: { $min: "$effectivePrice" },
          maxPrice: { $max: "$effectivePrice" },
        },
      },
      { $project: { _id: 0 } },
    ]);
    res.json(result[0] || { brands: [], minPrice: 0, maxPrice: 0 });
  } catch (err) {
    console.error("Lỗi khi lấy filter meta:", err);
    res.status(500).json({ message: "Lỗi server khi lấy filter meta" });
  }
};

// ================================
// Lấy toàn bộ sản phẩm (dùng cho trang chủ & admin)
// ================================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .select("name images description variants category effectivePrice brand ratingAverage");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================================
// Lấy sản phẩm theo danh mục cụ thể
// ================================
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    const products = await Product.find({
      category: new mongoose.Types.ObjectId(categoryId),
    }).populate("category", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================================
// Lấy chi tiết sản phẩm
// ================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================================
// Cập nhật tồn kho biến thể (giảm sau khi mua)
// ================================
const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const variant = product.variants.id(variantId);
    if (!variant)
      return res.status(404).json({ message: "Không tìm thấy biến thể" });

    if (variant.stock < quantity) {
      return res.status(400).json({ message: "Hết hàng!" });
    }

    variant.stock -= quantity;
    await product.save();
    res.json({ success: true, remaining: variant.stock });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật tồn kho" });
  }
};

// ================================
// Sản phẩm mới nhất
// ================================
const getNewProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm mới" });
  }
};

// ================================
// Sản phẩm bán chạy nhất
// ================================
const getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);
    const ids = topProducts.map((p) => p._id);
    const products = await Product.find({ _id: { $in: ids } })
      .populate("category", "name")
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm bán chạy" });
  }
};

// ================================
// Lấy danh sách thương hiệu theo danh mục
// ================================
const getBrandsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ message: "Thiếu ID danh mục" });
    }

    const products = await Product.find({ category: categoryId }).select("brand");
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm nào trong danh mục này" });
    }

    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    res.json({ brands });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách thương hiệu:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thương hiệu" });
  }
};

// ===================================================
// Bình luận (KHÔNG yêu cầu đăng nhập) — Realtime
// ===================================================
// Bình luận (KHÔNG yêu cầu đăng nhập)
// Nếu đã đăng nhập mà không chọn sao → không cho bình luận thuần.
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập bình luận!" });
    }

    // Nếu có Authorization header (tức là đã đăng nhập)
    //    => Không cho gửi bình luận thuần, bắt buộc dùng /ratings
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      return res
        .status(400)
        .json({ message: "Bạn đã đăng nhập, vui lòng chọn số sao để đánh giá!" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const newComment = {
      name: name?.trim() || "Khách ẩn danh",
      comment: comment.trim(),
      rating: 0,
      createdAt: new Date(),
    };

    product.reviews.push(newComment);
    await product.save();

    const io = req.app.get("io");
    io.to(`product:${id}`).emit("comment:new", { productId: id, comment: newComment });

    return res.json({ message: "Đã thêm bình luận!", comment: newComment });
  } catch (err) {
    console.error("❌ Lỗi khi thêm bình luận:", err);
    return res.status(500).json({ message: "Lỗi server khi thêm bình luận" });
  }
};


// ===================================================
// ⭐ Đánh giá sao (YÊU CẦU đăng nhập) — Realtime
// ===================================================
const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, name, comment } = req.body;

    // YÊU CẦU đăng nhập: req.user được gắn từ middleware auth
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Cần đăng nhập để đánh giá!" });

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Điểm đánh giá không hợp lệ!" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    product.reviews.push({
      user: userId,
      name: name?.trim() || "Người dùng",
      rating: Number(rating),
      comment: comment?.trim() || "",
      createdAt: new Date(),
    });

    const total = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    product.ratingCount = product.reviews.length;
    product.ratingAverage = Number((total / product.ratingCount).toFixed(1));

    await product.save();

    // 🔔 realtime
    const io = req.app.get("io");
    io.to(`product:${id}`).emit("rating:new", {
      productId: id,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
    });
    io.emit("rating:new", {
      productId: id,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
    });

    res.json({
      message: "Đã đánh giá sản phẩm!",
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm đánh giá:", err);
    res.status(500).json({ message: "Lỗi server khi thêm đánh giá" });
  }
};

// ================================
// ✅ Xuất module
// ================================
module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateVariantStock,
  getNewProducts,
  getBestSellers,
  getCatalogProducts,
  getFilterMeta,
  getBrandsByCategory,

  // mới thêm:
  addComment,
  addRating,
};
