const express = require("express");
const router = express.Router();
const { getAll, getById, getCount } = require("../../controllers/admin/adminOrderController");

router.get("/", getAll);        // Lấy toàn bộ đơn hàng
router.get("/count", getCount); // Đếm tổng số đơn hàng
router.get("/:id", getById);    // Lấy chi tiết 1 đơn hàng

module.exports = router;
