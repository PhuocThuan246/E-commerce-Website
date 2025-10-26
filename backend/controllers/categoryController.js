const Category = require("../models/Category");

// Lấy toàn bộ danh mục
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
}


module.exports = { getAllCategories };
