const mongoose = require("mongoose");

// ================================
// Schema của từng item trong giỏ hàng
//   - product: ID sản phẩm
//   - variantId: mỗi product có nhiều biến thể → lưu ID biến thể
//   - quantity: số lượng mua
// ================================
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: String, // lưu _id của variant trong product.variants
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

// ================================
// Cart Schema
//   - userId: nếu user đăng nhập
//   - sessionId: nếu user chưa đăng nhập (guest)
//   - items: danh sách sản phẩm trong giỏ
// ================================
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sessionId: { type: String, default: null },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
