// config/db.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // ===== AUTO SEED ADMIN =====
    const adminEmail = "admin@gmail.com";
    const adminPassword = "123456";

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      // KHÔNG tự hash ở đây — để pre('save') hash
      admin = await User.create({
        fullName: "Administrator",
        email: adminEmail,
        password: adminPassword, // plaintext -> pre('save') sẽ hash 1 lần
        address: "Trụ sở chính",
        role: "admin",
      });
      console.log("Đã tạo admin mặc định:", adminEmail);
    } else {
      // Đảm bảo đúng role
      if (admin.role !== "admin") {
        admin.role = "admin";
      }
      // Nếu mật khẩu hiện tại KHÔNG khớp 123456 -> reset lại
      const ok = await bcrypt.compare(adminPassword, admin.password || "");
      if (!ok) {
        admin.password = adminPassword; // gán plaintext để pre('save') hash
      }
      await admin.save(); // sẽ chạy pre('save') nếu password thay đổi
      console.log("Admin mặc định đã tồn tại (đã chuẩn hoá thông tin).");
    }
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
