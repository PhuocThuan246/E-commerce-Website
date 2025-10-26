const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: String,
  sku: String,
  price: Number,
  stock: Number,
  image: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  category: {
    type: mongoose.Schema.Types.ObjectId, // dùng ObjectId để liên kết Category
    ref: "Category",
    required: true,
  },
  description: String,
  image: String,
  variants: [variantSchema],
});

module.exports = mongoose.model("Product", productSchema);
