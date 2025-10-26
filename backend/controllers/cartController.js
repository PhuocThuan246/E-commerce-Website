const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");


// ==============================
// LẤY GIỎ HÀNG CHUẨN
// ==============================
const getCart = async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];

    // Luôn chỉ tìm theo sessionId cụ thể
    let cart = await Cart.findOne({ sessionId }).populate({
      path: "items.product",
      select: "name image category variants",
    });

    if (!cart) {
      // Nếu chưa có giỏ -> tạo mới
      cart = await Cart.create({ sessionId, items: [] });
      console.log("🆕 Created new cart for session:", sessionId);
    }

    // Bổ sung dữ liệu biến thể thực tế
    // Trong getCart:
    const enrichedItems = cart.items.map((item) => {
      const product = item.product;
      if (!product) return item;

      const variant = product.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      return {
        ...item.toObject(),
        product,
        variant,
      };
    });


    res.json({ ...cart.toObject(), items: enrichedItems });
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
    const sessionId = req.headers["x-session-id"] || uuidv4();

    let cart = await Cart.findOne({ sessionId });
    if (!cart) cart = await Cart.create({ sessionId, items: [] });

    // ✅ Lấy thông tin sản phẩm & biến thể
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

    // ✅ Kiểm tra tồn kho
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

    // ✅ Cập nhật hoặc thêm mới
    if (existingItem) {
      existingItem.quantity = totalQty;
    } else {
      cart.items.push({ product: productId, variantId, quantity });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.json({ cart: populated, sessionId });
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

    const cart = await Cart.findOne({ sessionId }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const item = cart.items.id(itemId);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });

    // ✅ Kiểm tra tồn kho trước khi cập nhật
    const product = item.product;
    const variant = product.variants.id(item.variantId);
    if (!variant)
      return res.status(404).json({ message: "Không tìm thấy biến thể" });

    if (quantity > variant.stock) {
      return res.status(400).json({
        message: `Số lượng vượt quá tồn kho (${variant.stock}).`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (error) {
    console.error("🔥 Lỗi updateQuantity:", error);
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
    const cart = await Cart.findOne({ sessionId });

    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = cart.items.filter((item) => item.id !== itemId);
    await cart.save();

    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (error) {
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
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = [];
    await cart.save();
    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
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
