const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const DiscountCode = require("../models/Discount");
const sendEmail = require("../utils/sendEmail");

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

    // 10. Gửi email xác nhận
    try {
        const orderItemsHtml = orderItems
          .map(
            (i) => `
              <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">
                  ${i.variantName ? `${i.variantName}` : "Sản phẩm"}
                </td>
                <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">
                  ${i.quantity}
                </td>
                <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">
                  ${(i.price * i.quantity).toLocaleString("vi-VN")} ₫
                </td>
              </tr>
            `
          )
          .join("");

        await sendEmail({
          to: email,
          subject: `🧾 Xác nhận đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
          html: `
          <div style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;padding:20px;box-shadow:0 4px 10px rgba(0,0,0,0.05)">
              
              <h2 style="color:#111827;text-align:center;margin-bottom:10px;">
                ✅ Đơn hàng của bạn đã được tạo thành công
              </h2>

              <p style="text-align:center;color:#6b7280;margin-top:0;">
                Cảm ơn bạn đã mua sắm tại <strong>E-Shop</strong>!
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

              <p><strong>Mã đơn:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
              <p><strong>Khách hàng:</strong> ${name}</p>
              <p><strong>SĐT:</strong> ${phone}</p>
              <p><strong>Địa chỉ:</strong> ${address}</p>

              <p><strong>Trạng thái hiện tại:</strong>
                <span style="
                  padding:4px 10px;
                  border-radius:20px;
                  background:#fef3c7;
                  color:#92400e;
                  font-weight:600;
                ">
                  ${STATUS_LABELS[order.status]}
                </span>
              </p>

              <h3 style="margin-top:20px;">📦 Chi tiết sản phẩm</h3>

              <table width="100%" style="border-collapse:collapse;font-size:14px;">
                <thead>
                  <tr style="background:#f3f4f6;">
                    <th style="padding:8px;text-align:left;">Sản phẩm</th>
                    <th style="padding:8px;text-align:center;">SL</th>
                    <th style="padding:8px;text-align:right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>

              <h3 style="margin-top:20px;">💰 Thanh toán</h3>
              <p>Tạm tính: ${subtotal.toLocaleString("vi-VN")} ₫</p>
              <p>Phí ship: ${finalShippingFee.toLocaleString("vi-VN")} ₫</p>
              <p>Thuế: ${finalTax.toLocaleString("vi-VN")} ₫</p>
              <p>Giảm giá: -${discountAmount.toLocaleString("vi-VN")} ₫</p>
              <p>Giảm bằng điểm: -${loyaltyDiscountAmount.toLocaleString("vi-VN")} ₫</p>

              <h2 style="color:#dc2626;">
                Tổng thanh toán: ${total.toLocaleString("vi-VN")} ₫
              </h2>

              <p>🎁 Điểm tích lũy từ đơn này: <strong>${loyaltyPointsEarned} điểm</strong></p>

              <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

              <p style="font-size:12px;color:#6b7280;text-align:center;">
                Nếu bạn có thắc mắc, vui lòng liên hệ CSKH qua hotline hoặc trả lời email này.
                <br/>
                &copy; ${new Date().getFullYear()} E-Shop. All rights reserved.
              </p>
            </div>
          </div>
          `,
        });

    } catch (e) {
      console.error("Gửi email đơn hàng thất bại:", e.message);
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
