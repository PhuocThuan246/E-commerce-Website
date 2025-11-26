const express = require("express");
const router = express.Router();
const { validateDiscountCode } = require("../controllers/discountController");

// ================================
// 📌 Discount Routes
//   - POST /api/discounts/validate
//   - Dùng ở màn Checkout khi người dùng nhập mã giảm giá
// ================================
router.post("/validate", validateDiscountCode);

module.exports = router;
