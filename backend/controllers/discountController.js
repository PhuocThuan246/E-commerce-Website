const DiscountCode = require("../models/Discount");

// ================================
// 📌 Kiểm tra mã giảm giá ở màn Checkout
//   - Input: code, subtotal
//   - Kiểm tra:
//       + code tồn tại?
//       + chưa vượt maxUsage?
//   - Output:
//       + valid: true/false
//       + discountAmount
//       + finalTotal
// ================================
const validateDiscountCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || typeof subtotal !== "number") {
      return res
        .status(400)
        .json({ valid: false, message: "Thiếu mã giảm giá hoặc subtotal" });
    }

    const upper = code.toUpperCase().trim();
    const dc = await DiscountCode.findOne({ code: upper });

    if (!dc) {
      return res
        .status(400)
        .json({ valid: false, message: "Mã giảm giá không tồn tại" });
    }

    if (dc.usedCount >= dc.maxUsage) {
      return res.status(400).json({
        valid: false,
        message: "Mã giảm giá đã hết lượt sử dụng",
      });
    }

    let discountAmount = 0;
    if (dc.type === "percent") {
      discountAmount = Math.round(subtotal * (dc.value / 100));
    } else {
      discountAmount = dc.value;
    }

    const finalTotal = Math.max(subtotal - discountAmount, 0);

    return res.json({
      valid: true,
      message: "Mã giảm giá hợp lệ",
      discountAmount,
      finalTotal,
      code: dc.code,
    });
  } catch (err) {
    console.error("🔥 Lỗi validateDiscountCode:", err);
    res
      .status(500)
      .json({ valid: false, message: "Lỗi server khi kiểm tra mã giảm giá" });
  }
};

module.exports = { validateDiscountCode };
