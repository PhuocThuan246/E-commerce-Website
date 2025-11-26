const express = require("express");
const router = express.Router();

const {
  getAll,
  getById,
  getCount,
  updateStatus,
} = require("../../controllers/admin/adminOrderController");
const {
  protect,
  adminOnly,
} = require("../../middlewares/authMiddleware");

// ✅ tất cả route dưới đều yêu cầu admin đăng nhập
router.use(protect, adminOnly);

// Danh sách + pagination + filter
router.get("/", getAll);

// Đếm tổng số đơn (dùng cho dashboard nếu cần)
router.get("/count", getCount);

// Chi tiết 1 đơn
router.get("/:id", getById);

// Đổi trạng thái đơn
router.patch("/:id/status", updateStatus);

module.exports = router;
