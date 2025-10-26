const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  address: String,
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }, // thêm dòng này
});

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
