const mongoose = require("mongoose");

// ================================
// DiscountCode Schema
//   - code: 5 ký tự, duy nhất, viết hoa
//   - type: kiểu giảm (percent/fixed)
//   - value: giá trị giảm (10% hoặc 100000 VND)
//   - maxUsage: số lần dùng tối đa (theo đề tối đa 10)
//   - usedCount: số lần đã dùng
// ================================
const discountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 5,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    value: {
      type: Number,
      required: true,
    },
    maxUsage: {
      type: Number,
      required: true,
      default: 10,
    },
    usedCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountCodeSchema);
