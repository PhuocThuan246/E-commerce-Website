const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
  sessionId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  customer: {
    name: String,
    phone: String,
    email: String,
    address: String,
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      variantName: String,
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
