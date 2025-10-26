const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
});

// RÀNG BUỘC: Tự động kiểm tra trước khi xóa
categorySchema.pre("findOneAndDelete", async function (next) {
  try {
    const id = this.getQuery()["_id"]; // lấy id của category đang bị xóa
    const Product = require("./Product");

    const count = await Product.countDocuments({ category: id });

    if (count > 0) {
      const err = new Error(
        `Không thể xóa danh mục này vì đang có ${count} sản phẩm liên quan.`
      );
      err.status = 400; // để controller có thể bắt được
      return next(err);
    }

    next(); // không có sản phẩm, cho phép xóa
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Category", categorySchema);
