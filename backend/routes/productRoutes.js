const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateVariantStock,
  getNewProducts,
  getBestSellers,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/detail/:id", getProductById);
router.put("/update-stock", updateVariantStock);

router.get("/new", getNewProducts);
router.get("/best-sellers", getBestSellers);

module.exports = router;
