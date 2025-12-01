const mongoose = require("mongoose");

// ==============================
// 🧩 Schema cho biến thể (variants)
// ==============================
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  image: String,
});

// ==============================
// ⭐ Schema cho đánh giá (reviews)
// ==============================
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    rating: { type: Number, min: 0, max: 5, default: 0 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ==============================
// 📦 Schema cho sản phẩm (products)
// ==============================
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ✅ Mô tả >=200 ký tự
    description: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => v && v.trim().length >= 200,
        message: "Mô tả phải có ít nhất 200 ký tự.",
      },
    },

    // ✅ Ảnh chính & gallery
    image: String,
    images: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 3,
        message: "Cần ít nhất 3 ảnh minh họa cho sản phẩm.",
      },
    },

    brand: { type: String, trim: true, default: "Unknown" },
    effectivePrice: { type: Number, default: 0 },
    variants: [variantSchema],
    reviews: [reviewSchema],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

// 🔍 Index cho tìm kiếm
productSchema.index({ name: "text", description: "text" });
productSchema.index({ brand: 1, effectivePrice: 1, ratingAverage: -1 });

// 🧮 Tính giá đại diện
function calcEffectivePrice(doc) {
  if (doc.variants && doc.variants.length > 0) {
    const prices = doc.variants.map((v) => v.price || Infinity);
    const minPrice = Math.min(...prices);
    return Number.isFinite(minPrice) ? minPrice : 0;
  }
  return 0;
}

// ⚙️ Middleware: cập nhật giá & rating
productSchema.pre("save", function (next) {
  this.effectivePrice = calcEffectivePrice(this);

  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.ratingCount = this.reviews.length;
    this.ratingAverage = Number((total / this.reviews.length).toFixed(1));
  } else {
    this.ratingCount = 0;
    this.ratingAverage = 0;
  }

  next();
});

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
