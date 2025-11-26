const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

// ================================
// 📌 ROUTES GIỎ HÀNG – SỬ DỤNG sessionId
// ================================

// Lấy giỏ
router.get("/", getCart);

// Thêm vào giỏ
router.post("/", addToCart);

// Cập nhật số lượng
router.put("/:itemId", updateQuantity);

// Xóa 1 item
router.delete("/:itemId", removeItem);

// Xóa toàn bộ giỏ
router.delete("/", clearCart);

module.exports = router;
