// app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
// user
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
// admin
const adminProductRoutes = require("./routes/admin/adminProductRoutes");
const adminCategoryRoutes = require("./routes/admin/adminCategoryRoutes");
const adminOrderRoutes = require("./routes/admin/adminOrderRoutes");
const adminUserRoutes = require("./routes/admin/adminUserRoutes");

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));




// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Welcome to E-commerce API");
});
// user
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
// admin
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);


// ===== ERROR HANDLER =====
app.use(function (req, res, next) {
  res.status(404).json({ message: "404 Not Found" });
});

module.exports = app;
