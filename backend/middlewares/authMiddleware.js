const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// 🔐 Chỉ cho phép admin
exports.adminOnly = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  // Tùy schema User của bạn:
  // - nếu dùng user.isAdmin => set isAdmin = true cho admin
  // - hoặc user.role === "admin"
  const isAdmin = user.isAdmin || user.role === "admin";

  if (!isAdmin) {
    return res.status(403).json({ message: "Bạn không có quyền admin" });
  }

  next();
};
