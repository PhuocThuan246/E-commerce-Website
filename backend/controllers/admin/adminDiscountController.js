const Discount = require("../../models/Discount");
const Order = require("../../models/Order");

// ============================
// Helper: random mã 5 ký tự
// ============================
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// ============================
// GET /admin/discounts
//  - danh sách mã + thông tin cơ bản
//  - kèm list đơn hàng đã dùng mã đó
// ============================
const getAllDiscounts = async (_req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });

    const results = await Promise.all(
      discounts.map(async (dc) => {
        const orders = await Order.find({ discountCode: dc._id })
          .select("customer total status createdAt")
          .sort({ createdAt: -1 });

        return {
          ...dc.toObject(),
          orders,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách mã giảm giá:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách mã giảm giá" });
  }
};

// ============================
// GET /admin/discounts/:id
// ============================
const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const dc = await Discount.findById(id);

    if (!dc)
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });

    const orders = await Order.find({ discountCode: dc._id })
      .select("customer total status createdAt")
      .sort({ createdAt: -1 });

    res.json({
      ...dc.toObject(),
      orders,
    });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết mã giảm giá:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy chi tiết mã giảm giá" });
  }
};

// ============================
// POST /admin/discounts
//  - tạo mã mới
// ============================
const createDiscount = async (req, res) => {
  try {
    let { code, type = "percent", value, maxUsage = 10 } = req.body;

    if (!value || typeof value !== "number" || value <= 0) {
      return res.status(400).json({ message: "Giá trị giảm không hợp lệ" });
    }

    maxUsage = parseInt(maxUsage) || 10;
    if (maxUsage < 1 || maxUsage > 10) {
      return res
        .status(400)
        .json({ message: "maxUsage phải từ 1 đến 10 theo đề bài" });
    }

    if (!code || !code.trim()) {
      code = generateCode();
    }

    code = code.toUpperCase().trim();
    if (!/^[A-Z0-9]{5}$/.test(code)) {
      return res
        .status(400)
        .json({ message: "Mã giảm giá phải gồm 5 ký tự A-Z hoặc 0-9" });
    }

    const exists = await Discount.findOne({ code });
    if (exists) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const discount = await Discount.create({
      code,
      type,
      value,
      maxUsage,
    });

    res.status(201).json(discount);
  } catch (err) {
    console.error("Lỗi khi tạo mã giảm giá:", err);
    res.status(500).json({ message: "Lỗi server khi tạo mã giảm giá" });
  }
};

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
};
