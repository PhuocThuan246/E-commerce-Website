const User = require("../models/User");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";


// =============================
// Đăng ký tài khoản
// =============================
exports.register = async (req, res) => {
  try {
    const { fullName, email, address, password, sessionId } = req.body;
    if (!email || !fullName)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        address,
        password, // Không hash ở đây nữa
      });
    }

    // Gán order/cart nếu có
    if (sessionId) {
      await Order.updateMany({ sessionId, userId: null }, { $set: { userId: user._id } });
      await Cart.updateMany({ sessionId, userId: null }, { $set: { userId: user._id } });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Đăng ký lỗi:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
};

// =============================
// Đăng nhập
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password, sessionId } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email chưa được đăng ký" });

    // Nếu user có mật khẩu, kiểm tra bcrypt
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Sai mật khẩu" });
    }

    // Liên kết Order và Cart cũ (guest) về tài khoản sau khi login
    if (sessionId) {
      await Order.updateMany(
        { sessionId, userId: null },
        { $set: { userId: user._id } }
      );
      await Cart.updateMany(
        { sessionId, userId: null },
        { $set: { userId: user._id } }
      );
    }

    // Tạo token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        role: user.role, // thêm dòng này
      },
    });

  } catch (err) {
    console.error("Đăng nhập lỗi:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

// =============================
// Hồ sơ người dùng
// =============================
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Lỗi lấy hồ sơ:", err);
    res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng" });
  }
};
