const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  variantId: {
    type: String, // lưu _id của variant trong product.variants
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sessionId: { type: String, default: null },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
