const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User"); 

// ==============================
// TẠO ĐƠN HÀNG (Guest hoặc Logged-in)
// ==============================
const createOrder = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];
    const { name, phone, email, address, selectedItems } = req.body;


    // Không cần token nữa
    let userId = null;
    // Lấy giỏ hàng
    const cart = await Cart.findOne({ sessionId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống!" });

    // Lọc sản phẩm được chọn
    const itemsToOrder =
      selectedItems && selectedItems.length > 0
        ? cart.items.filter((i) => selectedItems.includes(i._id.toString()))
        : cart.items;

    const orderItems = [];
    for (const item of itemsToOrder) {
      const product = item.product;
      const variant = product.variants.id(item.variantId);
      if (!variant)
        return res.status(400).json({ message: "Biến thể không tồn tại" });

      if (variant.stock < item.quantity)
        return res.status(400).json({ message: `${variant.name} đã hết hàng` });

      variant.stock -= item.quantity;
      orderItems.push({
        product: product._id,
        variantName: variant.name,
        quantity: item.quantity,
        price: variant.price,
      });

      await product.save();
    }

    // ==============================
    // Nếu chưa có userId → kiểm tra email để tạo tài khoản tự động
    // ==============================
    if (!userId && email) {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          fullName: name,
          email,
          password: "",
          role: "user",
          addresses: []
        });
      }

      // Lưu địa chỉ giao hàng vào danh sách địa chỉ
      const newAddress = {
        fullName: name,
        phone,
        city: address.split(",").slice(-1)[0]?.trim(),
        ward: address.split(",").slice(-2)[0]?.trim(),
        street: address.split(",").slice(0, -2).join(",").trim(),
        isDefault: user.addresses.length === 0
      };

      // chỉ thêm nếu địa chỉ chưa tồn tại
      const exists = user.addresses.some(a => a.street === newAddress.street);
      if (!exists) {
        user.addresses.push(newAddress);
        await user.save();
      }

      userId = user._id;
    }


    // ==============================
    // Tạo đơn hàng
    // ==============================
    const order = await Order.create({
      userId: userId || null,
      sessionId,
      customer: { name, phone, email, address },
      items: orderItems,
      total: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });

    console.log("Đơn hàng đã được tạo:", order._id);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng!" });
  }
};



// ==============================
// LẤY DANH SÁCH ĐƠN HÀNG (user hoặc guest)
// ==============================
const getOrders = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Vui lòng đăng nhập để xem đơn hàng" });
    }

    let userId = null;
    let email = null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }
      userId = user._id;
      email = user.email;
    } catch {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    const orders = await Order.find({ "customer.email": email })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng!" });
  }
};



module.exports = { createOrder, getOrders };
