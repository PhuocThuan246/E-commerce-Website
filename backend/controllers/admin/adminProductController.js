const Product = require("../../models/Product");

// ======================================================
// 📦 LẤY TOÀN BỘ SẢN PHẨM
// ======================================================
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

// ======================================================
// ➕ THÊM SẢN PHẨM (nhiều ảnh, validate mô tả)
// ======================================================
exports.create = async (req, res) => {
  try {
    const { name, category, description, brand } = req.body;

    if (!name || !category)
      return res.status(400).json({ message: "Thiếu tên hoặc danh mục!" });

    if (!description || description.trim().length < 200)
      return res
        .status(400)
        .json({ message: "Mô tả phải có ít nhất 200 ký tự!" });

    // ✅ Xử lý ảnh từ multiUpload (hỗ trợ 'images' & 'image')
    let images = [];
    if (req.files && (req.files.images || req.files.image)) {
      const arr = [];
      if (req.files.images) arr.push(...req.files.images);
      if (req.files.image) arr.push(...req.files.image);
      images = arr.map((f) => `/uploads/${f.filename}`);
    }

    if (!images || images.length < 3)
      return res.status(400).json({ message: "Cần ít nhất 3 ảnh sản phẩm!" });

    const product = new Product({
      name,
      category,
      brand: brand?.trim() || "Unknown",
      description: description.trim(),
      images,
      image: images[0], // ảnh đại diện
    });

    await product.save();
    res.status(201).json({ message: "✅ Đã thêm sản phẩm mới!", product });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    res.status(500).json({
      message: "Lỗi server khi thêm sản phẩm",
      error: err.message,
    });
  }
};

// ======================================================
// ✏️ CẬP NHẬT SẢN PHẨM
// ======================================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, brand } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    if (description && description.trim().length < 200)
      return res
        .status(400)
        .json({ message: "Mô tả phải có ít nhất 200 ký tự!" });

    // ✅ Hỗ trợ multiUpload khi cập nhật
    let images = [];
    if (req.files && (req.files.images || req.files.image)) {
      const arr = [];
      if (req.files.images) arr.push(...req.files.images);
      if (req.files.image) arr.push(...req.files.image);
      images = arr.map((f) => `/uploads/${f.filename}`);
    } else {
      images = product.images; // nếu không upload ảnh mới
    }

    if (!images || images.length < 3)
      return res.status(400).json({ message: "Cần ít nhất 3 ảnh sản phẩm!" });

    product.name = name || product.name;
    product.category = category || product.category;
    product.brand = brand?.trim() || product.brand;
    product.description = description?.trim() || product.description;
    product.images = images;
    product.image = images[0];

    await product.save();
    res.json({ message: "✅ Đã cập nhật sản phẩm!", product });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
    res.status(500).json({
      message: "Lỗi server khi cập nhật sản phẩm",
      error: err.message,
    });
  }
};

// ======================================================
// 🗑️ XÓA SẢN PHẨM
// ======================================================
exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    res.json({ message: "🗑️ Đã xóa sản phẩm!", product: deleted });
  } catch (err) {
    console.error("❌ Lỗi khi xóa sản phẩm:", err);
    res.status(500).json({
      message: "Lỗi server khi xóa sản phẩm",
      error: err.message,
    });
  }
};

// ======================================================
// 🧩 QUẢN LÝ BIẾN THỂ (Variant)
// ======================================================

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

    res.status(201).json({ message: "✅ Đã thêm biến thể mới!", product });
  } catch (err) {
    console.error("❌ Lỗi khi thêm biến thể:", err);
    res.status(500).json({
      message: "Lỗi server khi thêm biến thể",
      error: err.message,
    });
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
    res.json({ message: "✅ Đã cập nhật biến thể!", product });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật biến thể:", err);
    res.status(500).json({
      message: "Lỗi server khi cập nhật biến thể",
      error: err.message,
    });
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
    res.json({ message: "🗑️ Đã xóa biến thể!", product });
  } catch (err) {
    console.error("❌ Lỗi khi xóa biến thể:", err);
    res.status(500).json({
      message: "Lỗi server khi xóa biến thể",
      error: err.message,
    });
  }
};
