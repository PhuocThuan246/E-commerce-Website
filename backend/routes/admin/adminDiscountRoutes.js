const express = require("express");
const router = express.Router();

const {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
} = require("../../controllers/admin/adminDiscountController");

const {
  protect,
  adminOnly,
} = require("../../middlewares/authMiddleware");

// tất cả route dưới đều yêu cầu admin
router.use(protect, adminOnly);

// Danh sách mã + orders
router.get("/", getAllDiscounts);

// Chi tiết một mã + orders
router.get("/:id", getDiscountById);

// Tạo mã mới
router.post("/", createDiscount);

module.exports = router;
