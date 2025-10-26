const Order = require("../../models/Order");

// ============================
// LẤY TẤT CẢ ĐƠN HÀNG (ADMIN)
// ============================
const getAll = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name") // lấy tên sản phẩm
      .populate("userId", "fullName email") // lấy tên và email người dùng (nếu có)
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng" });
  }
};

// ============================
// LẤY CHI TIẾT 1 ĐƠN HÀNG
// ============================
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("items.product", "name price image")
      .populate("userId", "fullName email address");

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json(order);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng" });
  }
};

// ============================
// ĐẾM SỐ LƯỢNG ĐƠN HÀNG
// ============================
const getCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ totalOrders: count });
  } catch (err) {
    console.error("Lỗi khi đếm đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi đếm đơn hàng" });
  }
};

module.exports = { getAll, getById, getCount };
