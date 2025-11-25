const User = require("../models/User");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";


// =============================
// Đăng ký tài khoản (nâng cấp guest -> user thật)
// =============================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, sessionId, addresses } = req.body;

    if (!email || !fullName)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        password,
        addresses: addresses || [],   // ✅ dùng addresses thay cho address
      });
    } else {
      user.fullName = fullName ?? user.fullName;

      if (password && password.trim().length > 0) {
        user.password = password;
      }

      // ✅ nếu có addresses mới thì cập nhật
      if (addresses && addresses.length > 0) {
        user.addresses = addresses;
      }

      await user.save();
    }

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
        role: user.role,
        addresses: user.addresses, // ✅ trả về đúng danh sách địa chỉ
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
        addresses: user.addresses,
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


// Gửi mã OTP khôi phục mật khẩu
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Email không tồn tại" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordCode = otp;
  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendResetPasswordEmail(email, user.fullName, otp);

  res.json({ message: "Đã gửi mã OTP về email" });
};

// Xác nhận OTP và đổi mật khẩu
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

  if (
    user.resetPasswordCode !== otp ||
    user.resetPasswordExpire < Date.now()
  ) {
    return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
  }

  user.password = newPassword;
  user.resetPasswordCode = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công" });
};


exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return res.status(400).json({ message: "Mật khẩu cũ sai" });

  user.password = newPassword;
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công" });
};

exports.updateProfile = async (req, res) => {
  const { fullName } = req.body;

  const user = await User.findById(req.user.id);
  user.fullName = fullName ?? user.fullName;

  await user.save();

  res.json({ message: "Cập nhật hồ sơ thành công" });
};


exports.addAddress = async (req, res) => {
  const { fullName, phone, city, ward, street, isDefault } = req.body;

  const user = await User.findById(req.user.id);

  if (isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  user.addresses.push({ fullName, phone, city, ward, street, isDefault });
  await user.save();

  res.json(user.addresses);
};

exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
  await user.save();
  res.json(user.addresses);
};
