const fs = require("fs");
const mongoose = require("mongoose");

const Category = require("./models/Category");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const Discount = require("./models/Discount");

const connectDB = require("./config/db");

// Hàm xử lý ngày → giữ nếu hợp lệ, sửa nếu lỗi
function safeDate(d) {
  if (!d) return undefined;       // để Mongo tự dùng timestamp thực
  const date = new Date(d);
  return isNaN(date.getTime()) ? undefined : date;
}


(async () => {
  try {
    await connectDB();

    // ============================
    // 1. Đọc file JSON
    // ============================
    const categoriesData = JSON.parse(fs.readFileSync("./data/ecommerce.categories.json", "utf-8"));
    const productsData   = JSON.parse(fs.readFileSync("./data/ecommerce.products.json", "utf-8"));
    const usersData      = JSON.parse(fs.readFileSync("./data/ecommerce.users.json", "utf-8"));
    const ordersData     = JSON.parse(fs.readFileSync("./data/ecommerce.orders.json", "utf-8"));
    const discountsData  = JSON.parse(fs.readFileSync("./data/ecommerce.discounts.json", "utf-8"));

    // ============================
    // 2. Xoá dữ liệu cũ
    // ============================
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Discount.deleteMany({});
    console.log("Cleared old data");

    // ============================
    // 3. Convert Category
    // ============================
    const categories = categoriesData.map((c) => ({
      _id: new mongoose.Types.ObjectId(c._id.$oid),
      name: c.name,
      description: c.description || "",
    }));

    await Category.insertMany(categories);
    console.log("Inserted Categories");

    // ============================
    // 4. Convert Product (Không seed reviews)
    // ============================
    const products = productsData.map((p) => ({
      _id: new mongoose.Types.ObjectId(p._id.$oid),
      name: p.name,
      description: p.description,
      category: new mongoose.Types.ObjectId(p.category.$oid),

      images: Array.isArray(p.images) ? p.images : [],
      brand: p.brand || "Unknown",

      variants: (p.variants || []).map((v) => ({
        _id: new mongoose.Types.ObjectId(v._id.$oid),
        name: v.name,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        image: v.image,
      })),

      reviews: [], // KHÔNG seed review

      ratingAverage: 0,
      ratingCount: 0,
      tags: p.tags || [],
    }));

    await Product.insertMany(products);
    console.log("Inserted Products");

    // ============================
    // 5. Convert Users
    // ============================
    const users = usersData.map((u) => ({
      _id: new mongoose.Types.ObjectId(u._id.$oid),
      fullName: u.fullName,
      email: u.email,
      password: u.password, // sẽ hash ở pre-save
      role: u.role || "user",
      isBanned: u.isBanned || false,

      addresses: (u.addresses || []).map((a) => ({
        _id: a._id ? new mongoose.Types.ObjectId(a._id.$oid) : undefined,
        fullName: a.fullName,
        phone: a.phone,
        city: a.city,
        ward: a.ward,
        street: a.street,
        isDefault: a.isDefault || false,
      })),

      loyaltyPoints: u.loyaltyPoints || 0,
      resetPasswordCode: u.resetPasswordCode || null,
      resetPasswordExpire: safeDate(u.resetPasswordExpire),
    }));

    await User.insertMany(users);
    console.log("Inserted Users");

    // ============================
    // 6. Convert Discount Codes
    // ============================
    const discounts = discountsData.map((d) => ({
      _id: new mongoose.Types.ObjectId(d._id.$oid),
      code: d.code,
      type: d.type,
      value: d.value,
      maxUsage: d.maxUsage,
      usedCount: d.usedCount,
    }));

    await Discount.insertMany(discounts);
    console.log("Inserted Discounts");

    // ============================
    // 7. Convert Orders (GIỮ NGÀY CŨ, SỬA NGÀY LỖI)
    // ============================
    const orders = ordersData.map((o) => ({
      _id: new mongoose.Types.ObjectId(o._id.$oid),

      sessionId: o.sessionId || null,
      userId: o.userId ? new mongoose.Types.ObjectId(o.userId.$oid) : null,

      customer: o.customer || {},

      items: (o.items || []).map((item) => ({
        product: item.product ? new mongoose.Types.ObjectId(item.product.$oid) : null,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
      })),

      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      tax: o.tax,
      discountAmount: o.discountAmount,
      discountCode: o.discountCode
        ? new mongoose.Types.ObjectId(o.discountCode.$oid)
        : null,

      total: o.total,

      loyaltyPointsEarned: o.loyaltyPointsEarned || 0,
      loyaltyPointsUsed: o.loyaltyPointsUsed || 0,
      loyaltyDiscountAmount: o.loyaltyDiscountAmount || 0,

      status: o.status || "pending",

      statusHistory: (o.statusHistory || []).map((h) => ({
        status: h.status,
        updatedAt: safeDate(h.updatedAt),
      })),

      createdAt: safeDate(o.createdAt),
    }));

    await Order.insertMany(orders);
    console.log("Inserted Orders");

    console.log("SEED HOÀN TẤT!");
    process.exit(0);
  } catch (err) {
    console.error("Lỗi seed:", err);
    process.exit(1);
  }
})();
