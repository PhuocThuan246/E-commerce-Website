const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ================================
// 📌 Address Schema – một user có nhiều địa chỉ
// ================================
const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  city: String,
  ward: String,
  street: String,
  isDefault: { type: Boolean, default: false },
});

// ================================
// 📌 User Schema
// ================================
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBanned: { type: Boolean, default: false },
  addresses: [addressSchema],
  resetPasswordCode: String,
  resetPasswordExpire: Date,

  // ⭐ NEW: Điểm tích lũy (loyalty)
  loyaltyPoints: {
    type: Number,
    default: 0, // 0 point ban đầu
  },
});

// Hash password nếu bị thay đổi
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
