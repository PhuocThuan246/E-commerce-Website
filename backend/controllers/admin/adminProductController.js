const Product = require("../../models/Product");

// ============================
// LẤY TOÀN BỘ SẢN PHẨM (ADMIN)
// ============================
const getAll = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};

// ============================
// TẠO SẢN PHẨM MỚI (ADMIN)
// ============================
const create = async (req, res) => {
  try {
    const { name, category, description, image, variants } = req.body;

    if (!name || !category)
      return res.status(400).json({ message: "Thiếu tên hoặc danh mục" });

    const newProduct = await Product.create({
      name,
      category,
      description,
      image,
      variants: variants || [], // nhận từ form
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Lỗi khi tạo sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi tạo sản phẩm" });
  }
};


// ============================
// CẬP NHẬT SẢN PHẨM (ADMIN)
// ============================
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, image } = req.body;

    const updated = await Product.findByIdAndUpdate(
      id,
      { name, category, description, image },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
  }
};


// ============================
// XÓA SẢN PHẨM (ADMIN)
// ============================
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
};



// ============================
// THÊM BIẾN THỂ RIÊNG
// ============================
const addVariant = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, image = "", sku = "" } = req.body;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  const variant = { name, sku, price: Number(price)||0, stock: Number(stock)||0, image: String(image) }; // <- KHÔNG fallback product.image
  product.variants.push(variant);
  await product.save();
  const newVariant = product.variants[product.variants.length - 1];
  return res.status(201).json(newVariant); // trả đúng biến thể vừa tạo
};


// ============================
// CẬP NHẬT BIẾN THỂ RIÊNG
// ============================
const updateVariant = async (req, res) => {
  const { id, variantId } = req.params;
  const { name, price, stock, image, sku } = req.body;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  const v = product.variants.id(variantId);
  if (!v) return res.status(404).json({ message: "Không tìm thấy biến thể" });

  if (name !== undefined) v.name = name;
  if (sku !== undefined) v.sku = sku;
  if (price !== undefined) v.price = Number(price) || 0;
  if (stock !== undefined) v.stock = Number(stock) || 0;
  if (image !== undefined) v.image = String(image); // <- không tự set ảnh sản phẩm

  await product.save();
  return res.json(v); // trả đúng biến thể đã cập nhật
};


// ============================
// XÓA BIẾN THỂ RIÊNG
// ============================
const removeVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    product.variants = product.variants.filter(
      (v) => v._id.toString() !== variantId
    );
    await product.save();

    res.json({ success: true, message: "Đã xóa biến thể" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa biến thể" });
  }
};

module.exports = { getAll, create, update, remove, addVariant, removeVariant, updateVariant };
