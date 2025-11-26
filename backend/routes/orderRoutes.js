const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById } = require("../controllers/orderController");

// Lưu ý: đặt "/" trước "/:id" để tránh conflict
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;
