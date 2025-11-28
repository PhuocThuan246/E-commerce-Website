const mongoose = require("mongoose");

// ================================
// Lịch sử trạng thái đơn hàng
// ================================
const statusHistorySchema = new mongoose.Schema({
  status: String,
  updatedAt: { type: Date, default: Date.now },
});

// ================================
// Item của đơn hàng
// ================================
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variantName: String,
  quantity: Number,
  price: Number,
});

// ================================
// Order Schema
// ================================
const orderSchema = new mongoose.Schema({
  sessionId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  customer: {
    name: String,
    phone: String,
    email: String,
    address: String,
  },

  items: [orderItemSchema],

  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  discountAmount: Number,
  discountCode: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" },

  total: Number,

  // Loyalty
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  loyaltyDiscountAmount: { type: Number, default: 0 }, // tiền giảm do dùng điểm

  status: {
    type: String,
    enum: ["pending", "confirmed", "shipping", "delivered"],
    default: "pending",
  },

  statusHistory: [statusHistorySchema],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
