const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");


// ==============================
// HÀM FORMAT GIỎ HÀNG + SUMMARY
//  - Gom logic tính subtotal, tax, shippingFee, total
//  - Đồng thời gắn thêm thông tin biến thể (variant) vào từng item
// ==============================
const formatCart = (cart) => {
  if (!cart) return null;

  // items đã populate product
  const enrichedItems = cart.items.map((item) => {
    const product = item.product;
    if (!product) return item;

    // Tìm biến thể đúng với variantId đã lưu trong cart
    const variant = product.variants?.find(
      (v) => v._id.toString() === item.variantId.toString()
    );

    // Trả về object item mới, có thêm field product và variant đã populate
    return {
      ...item.toObject(),
      product,
      variant,
    };
  });

  // Tính tổng tiền hàng (subtotal) dựa trên giá của từng variant * quantity
  const subtotal = enrichedItems.reduce((sum, item) => {
    if (!item.variant) return sum;
    return sum + item.variant.price * item.quantity;
  }, 0);

  // Thuế (ví dụ VAT 10%) – có thể chỉnh lại theo yêu cầu
  const tax = Math.round(subtotal * 0.1);

  // Phí ship: ví dụ cố định 50k, nếu giỏ trống thì 0
  const shippingFee = subtotal > 0 ? 50000 : 0;

  // Tổng cộng = subtotal + tax + ship
  const total = subtotal + tax + shippingFee;

  // Trả về cart kèm theo summary để frontend hiển thị Cart Summary
  return {
    ...cart.toObject(),
    items: enrichedItems,
    summary: {
      subtotal,
      tax,
      shippingFee,
      total,
    },
  };
};


// ==============================
// LẤY GIỎ HÀNG CHUẨN
// ==============================
const getCart = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];

    // Luôn chỉ tìm theo sessionId cụ thể
    let cart = await Cart.findOne({ sessionId }).populate({
      path: "items.product",
      select: "name images category variants",
    });

    if (!cart) {
      // Nếu chưa có giỏ -> tạo mới
      cart = await Cart.create({ sessionId, items: [] });
      console.log("🆕 Created new cart for session:", sessionId);
    }

    // Dùng helper formatCart để gắn thêm variant + summary
    const formatted = formatCart(cart);
    return res.json(formatted);
  } catch (error) {
    console.error("Lỗi getCart:", error);
    res.status(500).json({ message: "Lỗi khi lấy giỏ hàng" });
  }
};


// ==============================
// THÊM SẢN PHẨM VÀO GIỎ (CÓ KIỂM TRA TỒN KHO)
// ==============================
const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    // Nếu client đã gửi x-session-id thì dùng lại, nếu chưa thì tạo mới
    const headerSessionId = req.headers["x-session-id"];
    const sessionId = headerSessionId || uuidv4();

    // Tìm hoặc tạo giỏ hàng theo sessionId
    let cart = await Cart.findOne({ sessionId });
    if (!cart) cart = await Cart.create({ sessionId, items: [] });

    // Lấy thông tin sản phẩm & biến thể
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const variant = product.variants.id(variantId);
    if (!variant)
      return res.status(404).json({ message: "Không tìm thấy biến thể" });

    // Kiểm tra tồn kho (tổng số lượng sau khi cộng thêm không được vượt stock)
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId && item.variantId === variantId
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    const totalQty = currentQty + quantity;

    if (totalQty > variant.stock) {
      return res.status(400).json({
        message: `Số lượng vượt quá tồn kho (${variant.stock}). Hiện còn ${variant.stock} sản phẩm.`,
      });
    }

    // Cập nhật hoặc thêm mới item trong giỏ
    if (existingItem) {
      existingItem.quantity = totalQty;
    } else {
      cart.items.push({ product: productId, variantId, quantity });
    }

    await cart.save();

    // Populate lại product để tính summary
    const populated = await cart.populate({
      path: "items.product",
      select: "name images category variants",
    });

    const formatted = formatCart(populated);

    // Trả về giống cấu trúc cũ của bạn: { cart, sessionId }
    res.json({ cart: formatted, sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng" });
  }
};


// ==============================
// CẬP NHẬT SỐ LƯỢNG (CÓ KIỂM TRA TỒN KHO)
// ==============================
const updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const sessionId = req.headers["x-session-id"];

    // Lấy giỏ hàng + populate product để có variants
    const cart = await Cart.findOne({ sessionId }).populate({
      path: "items.product",
      select: "name images category variants",
    });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const item = cart.items.id(itemId);
    if (!item)
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ" });

    // Kiểm tra tồn kho trước khi cập nhật
    const product = item.product;
    const variant = product.variants.id(item.variantId);
    if (!variant)
      return res.status(404).json({ message: "Không tìm thấy biến thể" });

    if (quantity > variant.stock) {
      return res.status(400).json({
        message: `Số lượng vượt quá tồn kho (${variant.stock}).`,
      });
    }

    // Cập nhật số lượng
    item.quantity = quantity;
    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      select: "name images category variants",
    });

    const formatted = formatCart(populated);
    res.json(formatted);
  } catch (error) {
    console.error("Lỗi updateQuantity:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật số lượng" });
  }
};


// ==============================
// XÓA SẢN PHẨM
// ==============================
const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = req.headers["x-session-id"];

    const cart = await Cart.findOne({ sessionId }).populate({
      path: "items.product",
      select: "name images category variants",
    });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    // Lọc bỏ item có id = itemId
    cart.items = cart.items.filter((item) => item.id !== itemId);
    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      select: "name image category variants",
    });

    const formatted = formatCart(populated);
    res.json(formatted);
  } catch (error) {
    console.error("Lỗi removeItem:", error);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
};


// ==============================
// XÓA TOÀN BỘ GIỎ HÀNG
// ==============================
const clearCart = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];
    const cart = await Cart.findOne({ sessionId });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = [];
    await cart.save();
    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    console.error("Lỗi clearCart:", error);
    res.status(500).json({ message: "Lỗi khi xóa toàn bộ giỏ" });
  }
};


// ==============================
// EXPORT
// ==============================
module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
