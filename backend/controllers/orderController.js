const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const DiscountCode = require("../models/Discount");
const userQueue = require("../queues/userQueue"); // path từ controllers/ tới file userQueue.js


// Quy ước Loyalty
const LOYALTY_RATE = 0.1;       // 10% tổng tiền
const VND_PER_POINT = 1000;     // 1 point = 1000 VND
const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao hàng",
  delivered: "Đã giao thành công",
};

// ==============================
// TẠO ĐƠN HÀNG (Guest hoặc Logged-in)
// ==============================
const createOrder = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];

    const {
      name,
      phone,
      email,
      address,
      selectedItems, // optional: danh sách item _id trong cart
      shippingFee = 0,
      tax = 0,
      discountCode, // optional
      discountAmount: clientDiscountAmount, // optional
      useLoyaltyPoints = false, // NEW: dùng điểm hay không
    } = req.body;

    if (!name || !phone || !email || !address) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin khách hàng (tên, sđt, email, địa chỉ)" });
    }

    // 1. Lấy giỏ hàng
    const cart = await Cart.findOne({ sessionId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống!" });

    const itemsToOrder =
      selectedItems && selectedItems.length > 0
        ? cart.items.filter((i) => selectedItems.includes(i._id.toString()))
        : cart.items;

    if (itemsToOrder.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm nào được chọn để đặt hàng" });
    }

    const orderItems = [];
    let subtotal = 0;

    // 2. Kiểm tra stock + tính subtotal
    for (const item of itemsToOrder) {
      const product = item.product;
      const variant = product.variants.id(item.variantId);

      if (!variant)
        return res.status(400).json({ message: "Biến thể không tồn tại" });

      if (variant.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `${variant.name} đã hết hàng hoặc không đủ số lượng` });

      // Trừ tồn kho
      variant.stock -= item.quantity;
      await product.save();

      const lineTotal = variant.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product: product._id,
        variantName: variant.name,
        quantity: item.quantity,
        price: variant.price,
      });
    }

    // 3. Xử lý user (tự tạo nếu guest)
    let userId = null;
    let user = null;

    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          fullName: name,
          email,
          password: "", // để rỗng, sau này user reset
          role: "user",
          addresses: [],
        });
      }

      const newAddress = {
        fullName: name,
        phone,
        city: address.split(",").slice(-1)[0]?.trim(),
        ward: address.split(",").slice(-2)[0]?.trim(),
        street: address.split(",").slice(0, -2).join(",").trim(),
        isDefault: user.addresses.length === 0,
      };

      const exists = user.addresses.some(
        (a) =>
          a.street === newAddress.street &&
          a.city === newAddress.city &&
          a.ward === newAddress.ward
      );

      if (!exists) {
        user.addresses.push(newAddress);
        await user.save();
      }

      userId = user._id;
    }

    // 4. Mã giảm giá
    let discountAmount = 0;
    let discountDoc = null;

    if (discountCode) {
      discountDoc = await DiscountCode.findOne({
        code: discountCode.toUpperCase(),
      });

      if (!discountDoc) {
        return res
          .status(400)
          .json({ message: "Mã giảm giá không tồn tại" });
      }

      if (discountDoc.usedCount >= discountDoc.maxUsage) {
        return res
          .status(400)
          .json({ message: "Mã giảm giá đã hết lượt sử dụng" });
      }

      const maxDiscount =
        discountDoc.type === "percent"
          ? Math.round((subtotal * discountDoc.value) / 100)
          : discountDoc.value;

      discountAmount = Math.min(maxDiscount, clientDiscountAmount ?? maxDiscount);

      discountDoc.usedCount += 1;
      await discountDoc.save();
    }

    const finalShippingFee = shippingFee;
    const finalTax = tax;

    // 5. Dùng Loyalty Points
    let loyaltyPointsUsed = 0;
    let loyaltyDiscountAmount = 0;

    if (useLoyaltyPoints && user && user.loyaltyPoints > 0) {
      const availablePoints = user.loyaltyPoints;

      // tối đa tiền có thể giảm trước khi âm
      const maxDiscountable =
        subtotal + finalShippingFee + finalTax - discountAmount;

      const maxPointsUsable = Math.floor(maxDiscountable / VND_PER_POINT);

      loyaltyPointsUsed = Math.min(availablePoints, maxPointsUsable);
      loyaltyDiscountAmount = loyaltyPointsUsed * VND_PER_POINT;
    }

    // 6. Tính total sau tất cả giảm
    let total =
      subtotal + finalShippingFee + finalTax - discountAmount - loyaltyDiscountAmount;
    if (total < 0) total = 0;

    // 7. Tính điểm nhận được
    let loyaltyPointsEarned = 0;
    if (user) {
      const moneyForPoints = total * LOYALTY_RATE; // 10% tiền
      loyaltyPointsEarned = Math.floor(moneyForPoints / VND_PER_POINT);
      user.loyaltyPoints =
        (user.loyaltyPoints || 0) - loyaltyPointsUsed + loyaltyPointsEarned;
      await user.save();
    }

    // 8. Tạo đơn hàng
    const order = await Order.create({
      userId: userId || null,
      sessionId,
      customer: { name, phone, email, address },
      items: orderItems,
      subtotal,
      shippingFee: finalShippingFee,
      tax: finalTax,
      discountAmount,
      discountCode: discountDoc ? discountDoc._id : null,
      total,
      status: "pending",
      statusHistory: [{ status: "pending", updatedAt: new Date() }],

      loyaltyPointsEarned,
      loyaltyPointsUsed,
      loyaltyDiscountAmount,
    });

    // 9. Xóa item đã đặt khỏi cart
    const remainingItems = cart.items.filter(
      (i) => !itemsToOrder.some((o) => o._id.toString() === i._id.toString())
    );
    cart.items = remainingItems;
    await cart.save();

    // 10. Đẩy job gửi email xác nhận vào Redis (BullMQ)
    try {
      await userQueue.add("order_confirmation", {
        email,
        name,
        phone,
        address,
        orderId: order._id.toString(),
        status: order.status,
        subtotal,
        shippingFee: finalShippingFee,
        tax: finalTax,
        discountAmount,
        loyaltyDiscountAmount,
        total,
        loyaltyPointsEarned,
        items: orderItems.map((i) => ({
          variantName: i.variantName,
          quantity: i.quantity,
          lineTotal: i.price * i.quantity,
        })),
      });

      console.log("[QUEUE] Đã đẩy job order_confirmation cho đơn", order._id.toString());
    } catch (e) {
      console.error("[QUEUE] Lỗi khi đẩy job email xác nhận đơn:", e.message);
    }

 

    console.log("Đơn hàng đã được tạo:", order._id);

    return res.json({ success: true, order });
  } catch (err) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng!" });
  }
};

// ==============================
// LẤY DANH SÁCH ĐƠN HÀNG (USER)
// ==============================
const getOrders = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để xem đơn hàng" });
    }

    let email = null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }
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

// ==============================
// LẤY CHI TIẾT 1 ĐƠN HÀNG (USER)
//  - kèm history status
// ==============================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để xem đơn hàng" });
    }

    let email = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }
      email = user.email;
    } catch {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    const order = await Order.findOne({
      _id: id,
      "customer.email": email,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // sort history mới nhất trước
    order.statusHistory.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(order);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng" });
  }
};

module.exports = { createOrder, getOrders, getOrderById };
