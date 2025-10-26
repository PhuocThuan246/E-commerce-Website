const Product = require("../models/Product");
const mongoose = require("mongoose");

// Lấy tất cả sản phẩm (kèm tên danh mục)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};



// Lấy theo ID danh mục
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    // Tìm sản phẩm có category trùng ID
    const products = await Product.find({ category: new mongoose.Types.ObjectId(categoryId) });

    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



// Lấy chi tiết sản phẩm
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};


// Cập nhật tồn kho sau khi đặt hàng
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

module.exports = { getAllProducts, getProductsByCategory, getProductById, updateVariantStock};
