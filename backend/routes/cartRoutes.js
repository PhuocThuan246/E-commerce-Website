const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

// /api/cart
router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateQuantity);
router.delete("/:itemId", removeItem);
router.delete("/", clearCart);

module.exports = router;
