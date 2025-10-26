const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateVariantStock,
} = require("../controllers/productController");

// /api/products
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/detail/:id", getProductById)
router.put("/update-stock", updateVariantStock);

module.exports = router;
