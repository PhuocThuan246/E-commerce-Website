const express = require("express");
const router = express.Router();

const {
  simpleDashboard,
  advancedDashboard
} = require("../../controllers/admin/adminDashboardController");

const { protect, adminOnly } = require("../../middlewares/authMiddleware");

// Bắt buộc admin
router.use(protect, adminOnly);

// SIMPLE DASHBOARD
router.get("/simple", simpleDashboard);

// ADVANCED DASHBOARD
router.get("/advanced", advancedDashboard);

module.exports = router;
