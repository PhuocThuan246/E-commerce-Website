// ================================
// 📌 IMPORT CÁC THƯ VIỆN CẦN DÙNG
// ================================
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Socket.IO
const http = require("http");
const { Server } = require("socket.io");

// ================================
// 📌 IMPORT CÁC ROUTES
// ================================
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

// ADMIN ROUTES
const adminProductRoutes = require("./routes/admin/adminProductRoutes");
const adminCategoryRoutes = require("./routes/admin/adminCategoryRoutes");
const adminOrderRoutes = require("./routes/admin/adminOrderRoutes");
const adminUserRoutes = require("./routes/admin/adminUserRoutes");
const adminDiscountRoutes = require("./routes/admin/adminDiscountRoutes");

// 🆕 Route mã giảm giá cho khách (checkout)
const discountRoutes = require("./routes/discountRoutes");

// ================================
// 📌 CONFIG
// ================================
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ================================
// 📌 KHAI BÁO ROUTES
// ================================
app.get("/", (req, res) => {
  res.send("Welcome to E-commerce API");
});

// Customer APIs
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

// Admin APIs
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/discounts", adminDiscountRoutes);

// Discount cho checkout (validate code)
app.use("/api/discounts", discountRoutes);

// ================================
// 📌 404 – Route không tồn tại
// ================================
app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

// ================================
// 📌 KHỞI TẠO SERVER CÓ SOCKET.IO
// ================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

// Cho phép controller emit sự kiện real-time
app.set("io", io);

io.on("connection", (socket) => {
  socket.on("product:join", (productId) => {
    socket.join(`product:${productId}`);
  });

  socket.on("disconnect", () => {});
});

// ================================
// 📌 TỰ LẮNG NGHE NẾU CHẠY TRỰC TIẾP
// ================================
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 API & Socket.IO running on port ${PORT}`);
  });
}

module.exports = app;
