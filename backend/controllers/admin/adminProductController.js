const Product = require("../../models/Product");
const fs = require("fs");
const path = require("path");
// ======================================================
// LẤY TOÀN BỘ SẢN PHẨM
// ======================================================
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};

// ======================================================
// THÊM SẢN PHẨM (nhiều ảnh, validate mô tả)
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

    // Xử lý ảnh từ multiUpload (hỗ trợ 'images' & 'image')
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
    res.status(201).json({ message: "Đã thêm sản phẩm mới!", product });
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
    res.status(500).json({
      message: "Lỗi server khi thêm sản phẩm",
      error: err.message,
    });
  }
};

// ======================================================
// CẬP NHẬT SẢN PHẨM
// ======================================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, brand } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    // 1. Cập nhật field text
    if (name) product.name = name;
    if (category) product.category = category;
    if (brand) product.brand = brand.trim();

    if (description) {
      if (description.trim().length < 200) {
        return res
          .status(400)
          .json({ message: "Mô tả phải có ít nhất 200 ký tự!" });
      }
      product.description = description.trim();
    }

    // 2. Xác định ảnh upload mới
    let newImages = [];

    if (req.files && (req.files.images || req.files.image)) {
      const arr = [];
      if (req.files.images) arr.push(...req.files.images);
      if (req.files.image) arr.push(...req.files.image);

      newImages = arr.map((f) => `/uploads/${f.filename}`);
    }

    // 3. CHỈ thay ảnh nếu upload ảnh mới
    if (newImages.length > 0) {
      product.images = newImages;
      product.image = newImages[0];
    }

    // 4. Lưu (validateModifiedOnly TRUE)
    await product.save({ validateModifiedOnly: true });

    res.json({ message: "Đã cập nhật sản phẩm!", product });

  } catch (err) {
    console.error("Lỗi khi cập nhật sản phẩm:", err);
    res.status(500).json({
      message: "Lỗi server khi cập nhật sản phẩm",
      error: err.message,
    });
  }
};




// ======================================================
// XÓA SẢN PHẨM
// ======================================================
    exports.remove = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

      const images = product.images || [];

      // Xóa product khỏi DB
      await Product.findByIdAndDelete(req.params.id);

      // CHECK TỪNG ẢNH
      for (let imgPath of images) {

        // imgPath đang là: /uploads/xxxxx.jpg
        // cần tách tên file thôi
        const filename = imgPath.replace("/uploads/", "");

        // Kiểm tra ảnh có được dùng ở sản phẩm khác không
        const existsInOtherProduct = await Product.findOne({
          images: imgPath  // DB lưu dạng /uploads/xxxxx.jpg -> giữ nguyên
        });

        if (existsInOtherProduct) {
          console.log(`Ảnh ${filename} vẫn đang được dùng → KHÔNG xóa`);
          continue;
        }

        // Đường dẫn file thực trên ổ đĩa
        const filePath = path.join(__dirname, "../../public/uploads", filename);

        console.log("Thử xóa:", filePath);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(`Không thể xóa ảnh ${filename}:`, err.message);
          } else {
            console.log(`Đã xóa ảnh: ${filename}`);
          }
        });
      }

      res.json({
        message: "Đã xóa sản phẩm! Ảnh dùng chung được giữ lại.",
        product,
      });

    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      res.status(500).json({
        message: "Lỗi server khi xóa sản phẩm",
        error: err.message,
      });
    }
  };


// ======================================================
// QUẢN LÝ BIẾN THỂ (Variant)
// ======================================================

// Thêm biến thể mới
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
      image: "", // không dùng ảnh cho biến thể
    };

    product.variants.push(newVariant);
    await product.save();

    res.status(201).json(product.variants[product.variants.length - 1]);

  } catch (err) {
    console.error("Lỗi khi thêm biến thể:", err);
    res.status(500).json({
      message: "Lỗi server khi thêm biến thể",
      error: err.message,
    });
  }
};

// Cập nhật biến thể
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

    await product.save();
    res.json(variant);
  } catch (err) {
    console.error("Lỗi khi cập nhật biến thể:", err);
    res.status(500).json({
      message: "Lỗi server khi cập nhật biến thể",
      error: err.message,
    });
  }
};

// Xóa biến thể
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
    console.error("Lỗi khi xóa biến thể:", err);
    res.status(500).json({
      message: "Lỗi server khi xóa biến thể",
      error: err.message,
    });
  }
};
