const Category = require("../../models/Category");
const Product = require("../../models/Product");
// Lấy tất cả danh mục
const getAll = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
};

// Thêm mới danh mục
const create = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name)
      return res.status(400).json({ message: "Thiếu tên danh mục" });

    const exists = await Category.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Danh mục đã tồn tại" });

    const newCat = await Category.create({ name, description });
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo danh mục" });
  }
};

// Cập nhật danh mục
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật danh mục" });
  }
};

// Xóa danh mục (kiểm tra ràng buộc)
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra có sản phẩm nào thuộc danh mục này không
    const count = await Product.countDocuments({ category: id });

    if (count > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục này vì đang có ${count} sản phẩm liên quan.`,
        productCount: count, // chỉ gửi số lượng sản phẩm
      });
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa danh mục thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa danh mục." });
  }
};


module.exports = { getAll, create, update, remove };
