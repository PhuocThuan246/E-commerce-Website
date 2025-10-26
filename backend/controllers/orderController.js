const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User"); // thêm dòng này

// ==============================
// TẠO ĐƠN HÀNG (Guest hoặc Logged-in)
// ==============================
const createOrder = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    const { name, phone, email, address, selectedItems } = req.body;

    // Xác định userId nếu có token
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
    }

    const cart = await Cart.findOne({ sessionId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống!" });

    // Lọc sản phẩm
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
        return res
          .status(400)
          .json({ message: `${variant.name} đã hết hàng` });

      variant.stock -= item.quantity;
      orderItems.push({
        product: product._id,
        variantName: variant.name,
        quantity: item.quantity,
        price: variant.price,
      });

      await product.save();
    }

    // Nếu chưa login nhưng email trùng user → gắn userId
    if (!userId && email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) userId = existingUser._id;
    }

    const order = await Order.create({
      userId: userId || null,
      sessionId,
      customer: { name, phone, email, address },
      items: orderItems,
      total: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng!" });
  }
};

// ==============================
// LẤY DANH SÁCH ĐƠN HÀNG (user hoặc guest)
// ==============================
const getOrders = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    let email = null;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          userId = user._id;
          email = user.email;
        }
      } catch {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
    }

    let query = {};

    if (email) {
      // Ưu tiên lọc theo email đăng nhập
      query = { "customer.email": email };
    } else if (sessionId) {
      // Nếu chưa login, dùng sessionId
      query = { sessionId };
    } else {
      return res.status(400).json({ message: "Thiếu session ID hoặc email" });
    }

    console.log("🧾 Lọc đơn hàng với điều kiện:", query);

    const orders = await Order.find(query)
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng!" });
  }
};


module.exports = { createOrder, getOrders };
