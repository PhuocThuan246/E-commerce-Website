const Order = require("../../models/Order");

// ============================
// Helper: build điều kiện lọc theo thời gian
// ============================
function buildDateFilter(filter, start, end) {
  const now = new Date();
  let gte, lte;

  switch (filter) {
    case "today": {
      gte = new Date(now);
      gte.setHours(0, 0, 0, 0);
      lte = new Date(now);
      lte.setHours(23, 59, 59, 999);
      break;
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      gte = new Date(y);
      gte.setHours(0, 0, 0, 0);
      lte = new Date(y);
      lte.setHours(23, 59, 59, 999);
      break;
    }
    case "week": {
      const day = now.getDay(); // 0: Sun
      const diffToMonday = (day + 6) % 7;
      gte = new Date(now);
      gte.setDate(gte.getDate() - diffToMonday);
      gte.setHours(0, 0, 0, 0);
      lte = new Date(now);
      lte.setHours(23, 59, 59, 999);
      break;
    }
    case "month": {
      gte = new Date(now.getFullYear(), now.getMonth(), 1);
      lte = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lte.setHours(23, 59, 59, 999);
      break;
    }
    case "range": {
      if (!start || !end) return {};
      gte = new Date(start);
      gte.setHours(0, 0, 0, 0);
      lte = new Date(end);
      lte.setHours(23, 59, 59, 999);
      break;
    }
    default:
      return {};
  }

  return { createdAt: { $gte: gte, $lte: lte } };
}

// ============================
// GET /admin/orders
//  - danh sách đơn, sort mới nhất
//  - pagination ~20/ trang
//  - filter theo: today, yesterday, week, month, range
// ============================
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      filter = "all",
      start,
      end,
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);

    const query = {};
    if (filter !== "all") {
      Object.assign(query, buildDateFilter(filter, start, end));
    }

    const totalItems = await Order.countDocuments(query);
    const totalPages = Math.max(Math.ceil(totalItems / limitNum), 1);

    const orders = await Order.find(query)
      .populate("items.product", "name")
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng" });
  }
};

// ============================
// GET /admin/orders/:id
//  - xem chi tiết đơn, lịch sử trạng thái
// ============================
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("items.product", "name price image")
      .populate("userId", "fullName email addresses loyaltyPoints")
      .populate("discountCode", "code type value");

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // sắp xếp history: mới nhất trước
    order.statusHistory.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(order);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng" });
  }
};

// ============================
// GET /admin/orders/count  (optional, dùng cho dashboard)
// ============================
const getCount = async (_req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ totalOrders: count });
  } catch (err) {
    console.error("Lỗi khi đếm đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi đếm đơn hàng" });
  }
};

// ============================
// PATCH /admin/orders/:id/status
//  - đổi trạng thái + lưu history
// ============================
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "confirmed", "shipping", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
    });

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đơn:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái đơn" });
  }
};

module.exports = { getAll, getById, getCount, updateStatus };
