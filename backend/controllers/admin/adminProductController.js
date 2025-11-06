const Product = require("../../models/Product");

// ==============================
// 📦 LẤY TOÀN BỘ SẢN PHẨM
// ==============================
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};

// ==============================
// ➕ THÊM SẢN PHẨM
// ==============================
exports.create = async (req, res) => {
  try {
    const { name, category, description, price, brand } = req.body; // ✅ thêm brand

    if (!name || !category)
      return res.status(400).json({ message: "Thiếu tên hoặc danh mục!" });

    const product = new Product({
      name,
      category,
      brand: brand?.trim() || "Unknown", // ✅ lưu brand
      description,
      price: price ? Number(price) : 0,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await product.save();
    res.status(201).json({ message: "Đã thêm sản phẩm mới!", product });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm" });
  }
};

// ==============================
// ✏️ CẬP NHẬT SẢN PHẨM
// ==============================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, brand } = req.body; // ✅ thêm brand

    const updateData = {
      name,
      category,
      brand: brand?.trim() || "Unknown", // ✅ cập nhật brand
      description,
      price: price ? Number(price) : 0,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    res.json({ message: "Đã cập nhật sản phẩm!", product: updated });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm" });
  }
};

// ==============================
// 🗑️ XÓA SẢN PHẨM
// ==============================
exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    res.json({ message: "Đã xóa sản phẩm!", product: deleted });
  } catch (err) {
    console.error("❌ Lỗi khi xóa sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
};

// =========================================================
// 🧩 QUẢN LÝ BIẾN THỂ (Variant)
// =========================================================

// ➕ Thêm biến thể mới
exports.addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    const newVariant = {
      name,
      sku,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    };

    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({ message: "Đã thêm biến thể mới!", product });
  } catch (err) {
    console.error("❌ Lỗi khi thêm biến thể:", err);
    res.status(500).json({ message: "Lỗi server khi thêm biến thể" });
  }
};

// ✏️ Cập nhật biến thể
exports.updateVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { name, sku, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    const variant = product.variants.id(variantId);
    if (!variant)
      return res.status(404).json({ message: "Không tìm thấy biến thể!" });

    variant.name = name || variant.name;
    variant.sku = sku || variant.sku;
    variant.price = Number(price) || variant.price;
    variant.stock = Number(stock) || variant.stock;

    if (req.file) variant.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.json({ message: "Đã cập nhật biến thể!", product });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật biến thể:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật biến thể" });
  }
};

// 🗑️ Xóa biến thể
exports.removeVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    product.variants = product.variants.filter(
      (v) => v._id.toString() !== variantId
    );

    await product.save();
    res.json({ message: "Đã xóa biến thể!", product });
  } catch (err) {
    console.error("❌ Lỗi khi xóa biến thể:", err);
    res.status(500).json({ message: "Lỗi server khi xóa biến thể" });
  }
};
