const Product = require("../../models/Product");
const fs = require("fs");
const path = require("path");

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
    const { name, category, description } = req.body;

    if (!name || !category)
      return res.status(400).json({ message: "Thiếu tên hoặc danh mục" });

    let imagePath = "";
    if (req.file) {
      // Nếu có upload ảnh
      imagePath = `/uploads/${req.file.filename}`; // URL tương đối
    }

    const newProduct = await Product.create({
      name,
      category,
      description,
      image: imagePath,
      variants: [],
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
    const { name, category, description } = req.body;

    const updateData = { name, category, description };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
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

    // Xóa ảnh sản phẩm chính (nếu có)
    if (deleted.image) {
      const mainImagePath = path.join(__dirname, "../../public", deleted.image);
      if (fs.existsSync(mainImagePath)) {
        fs.unlinkSync(mainImagePath);
      }
    }

    // Xóa ảnh của các biến thể (nếu có)
    if (deleted.variants && deleted.variants.length > 0) {
      for (const variant of deleted.variants) {
        if (variant.image) {
          const variantImagePath = path.join(__dirname, "../../public", variant.image);
          if (fs.existsSync(variantImagePath)) {
            fs.unlinkSync(variantImagePath);
          }
        }
      }
    }

    res.json({ success: true, message: "Đã xóa sản phẩm và tất cả ảnh liên quan" });
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
};




// ============================
// THÊM BIẾN THỂ (CÓ ẢNH)
// ============================
const addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    // Nếu có upload ảnh
    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const variant = {
      name,
      sku,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      image: imagePath,
    };

    product.variants.push(variant);
    await product.save();

    const newVariant = product.variants[product.variants.length - 1];
    res.status(201).json(newVariant);
  } catch (err) {
    console.error("Lỗi khi thêm biến thể:", err);
    res.status(500).json({ message: "Lỗi khi thêm biến thể" });
  }
};


// ============================
// CẬP NHẬT BIẾN THỂ (CÓ ẢNH)
// ============================
const updateVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { name, sku, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const v = product.variants.id(variantId);
    if (!v) return res.status(404).json({ message: "Không tìm thấy biến thể" });

    // Nếu upload ảnh mới, xóa ảnh cũ
    if (req.file) {
      if (v.image) {
        const oldPath = path.join(__dirname, "../../public", v.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      v.image = `/uploads/${req.file.filename}`;
    }

    if (name !== undefined) v.name = name;
    if (sku !== undefined) v.sku = sku;
    if (price !== undefined) v.price = Number(price) || 0;
    if (stock !== undefined) v.stock = Number(stock) || 0;

    await product.save();
    res.json(v);
  } catch (err) {
    console.error("Lỗi khi cập nhật biến thể:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật biến thể" });
  }
};


// ============================
// XÓA BIẾN THỂ (XÓA ẢNH LUÔN)
// ============================
const removeVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const v = product.variants.id(variantId);
    if (!v)
      return res.status(404).json({ message: "Không tìm thấy biến thể" });

    // Xóa ảnh biến thể nếu có
    if (v.image) {
      const imgPath = path.join(__dirname, "../../public", v.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Xóa biến thể
    if (typeof v.deleteOne === "function") {
      // Mongoose 6/7
      v.deleteOne();
    } else {
      // fallback (Mongoose 5)
      product.variants.pull({ _id: variantId });
    }

    await product.save();
    res.json({ success: true, message: "Đã xóa biến thể và ảnh" });
  } catch (err) {
    console.error("Lỗi khi xóa biến thể:", err);
    res.status(500).json({ message: "Lỗi khi xóa biến thể" });
  }
};


module.exports = { getAll, create, update, remove, addVariant, removeVariant, updateVariant };
