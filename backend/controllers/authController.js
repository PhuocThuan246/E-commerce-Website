const User = require("../models/User");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";


// =============================
// Đăng ký tài khoản (nâng cấp guest -> user thật)
// =============================
exports.register = async (req, res) => {
  try {
    const { fullName, email, address, password, sessionId } = req.body;
    if (!email || !fullName)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

    let user = await User.findOne({ email });

    if (!user) {
      // Tạo mới bình thường
      user = await User.create({
        fullName,
        email,
        address,
        password, // pre('save') sẽ hash
      });
    } else {
      // "Nâng cấp" tài khoản guest: cập nhật thông tin + set password nếu có
      user.fullName = fullName ?? user.fullName;
      user.address  = address  ?? user.address;

      // Nếu tài khoản từng tạo auto (password rỗng/null) hoặc user vừa nhập mật khẩu mới
      if (password && password.trim().length > 0) {
        user.password = password; // pre('save') sẽ hash
      }

      await user.save(); // chạy pre('save')
    }

    // Liên kết đơn/giỏ của session guest về user
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

    // CHẶN ĐĂNG NHẬP NẾU BỊ KHÓA
    if (user.isBanned) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!",
      });
    }

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
        role: user.role,
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
