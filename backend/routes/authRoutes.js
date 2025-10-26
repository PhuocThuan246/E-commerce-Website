const express = require("express");
const router = express.Router();
const { register, login, profile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);

module.exports = router;
