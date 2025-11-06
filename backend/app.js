const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// routes
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

// 🔌 Socket.IO
const http = require("http");
const { Server } = require("socket.io");

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
app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

// ===== Socket.IO server (an toàn với cả bin/www lẫn chạy trực tiếp) =====
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

// cho controller sử dụng
app.set("io", io);

io.on("connection", (socket) => {
  // client có thể join room theo productId để giảm broadcast nếu muốn
  socket.on("product:join", (productId) => {
    socket.join(`product:${productId}`);
  });
  socket.on("disconnect", () => {});
});

// Chỉ tự lắng nghe khi chạy trực tiếp `node app.js`
// Nếu bạn dùng bin/www thì phần này sẽ không kích hoạt (tránh double listen)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 API & Socket.IO running on port ${PORT}`);
  });
}

// Giữ export app như cũ để tương thích bin/www
module.exports = app;
