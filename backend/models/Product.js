const mongoose = require("mongoose");

// ==============================
// Schema cho biến thể (variants)
// ==============================
const variantSchema = new mongoose.Schema({
  name: String,
  sku: String,
  price: Number,
  stock: Number,
  image: String,
});

// ==============================
// Schema cho đánh giá (reviews)
// ==============================
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: String,
    rating: { type: Number, min: 0, max: 5, default: 0 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ==============================
// Schema cho sản phẩm (products)
// ==============================
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    image: String,
    images: [String],

    // Thêm brand để lọc và hiển thị thương hiệu
    brand: {
      type: String,
      trim: true,
      default: "Unknown",
    },

    effectivePrice: { type: Number, default: 0 },
    variants: [variantSchema],
    reviews: [reviewSchema],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

// Index cho tìm kiếm & lọc nhanh
productSchema.index({ name: "text", description: "text" });
productSchema.index({ brand: 1, effectivePrice: 1, ratingAverage: -1 });

// Hàm tính giá đại diện
function calcEffectivePrice(doc) {
  if (doc.variants && doc.variants.length > 0) {
    const prices = doc.variants.map((v) => v.price || Infinity);
    const minPrice = Math.min(...prices);
    return Number.isFinite(minPrice) ? minPrice : doc.price || 0;
  }
  return doc.price || 0;
}

// Middleware: tính lại giá & rating trước khi save
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

productSchema.methods.updateAverageRating = async function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.ratingAverage = 0;
    this.ratingCount = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    this.ratingCount = this.reviews.length;
    this.ratingAverage = Number((total / this.reviews.length).toFixed(1));
  }
  await this.save();
};

productSchema.methods.recalcEffectivePrice = async function () {
  this.effectivePrice = calcEffectivePrice(this);
  await this.save();
};

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
