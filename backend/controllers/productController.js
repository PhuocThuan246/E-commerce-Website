// controllers/productController.js
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// ================================
// Lấy tất cả sản phẩm (kèm tên danh mục)
// ================================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================================
// Lấy sản phẩm theo danh mục
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
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================================
// Lấy chi tiết sản phẩm
// ================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================================
// Cập nhật tồn kho sau khi đặt hàng
// ================================
const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

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
// NEW PRODUCTS (sản phẩm mới nhất)
// ================================
const getNewProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 }) // sắp xếp mới nhất
      .limit(limit);
    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm mới:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm mới" });
  }
};

// ================================
// BEST SELLERS (dùng Aggregate từ Order)
// ================================
const getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;

    // Gom nhóm theo productId trong các order
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    const ids = topProducts.map((p) => p._id);
    const products = await Product.find({ _id: { $in: ids } })
      .populate("category", "name")
      .lean();

    // Giữ thứ tự theo tổng bán
    const rankMap = new Map(topProducts.map((p) => [String(p._id), p.totalSold]));
    products.sort((a, b) => (rankMap.get(String(b._id)) || 0) - (rankMap.get(String(a._id)) || 0));

    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm bán chạy" });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateVariantStock,
  getNewProducts,
  getBestSellers,
};
