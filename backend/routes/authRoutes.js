const express = require("express");
const router = express.Router();
const User = require("../models/User"); 

const {
  register,
  login,
  profile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
  addAddress,
  deleteAddress,
} = require("../controllers/authController");
// Google
const { googleLogin } = require("../controllers/authController");
router.post("/google-login", googleLogin);




const { protect } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);

// Address
router.post("/address", protect, addAddress);
router.delete("/address/:id", protect, deleteAddress);

// Lấy danh sách địa chỉ user
router.get("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user?.addresses || []);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy địa chỉ" });
  }
});

module.exports = router;
