const express = require("express");
const router = express.Router();
const adminProductCtrl = require("../../controllers/admin/adminProductController");
const { upload, multiUpload } = require("../../middlewares/upload");

// ==============================
// CRUD SẢN PHẨM (upload nhiều ảnh)
// ==============================
router.get("/", adminProductCtrl.getAll);

// Dùng multiUpload: hỗ trợ cả 'image' và 'images'
router.post("/", multiUpload, adminProductCtrl.create);
router.put("/:id", multiUpload, adminProductCtrl.update);

router.delete("/:id", adminProductCtrl.remove);

// ==============================
// BIẾN THỂ SẢN PHẨM (1 ảnh đơn lẻ)
// ==============================
router.post("/:id/variants", upload.single("image"), adminProductCtrl.addVariant);
router.put("/:id/variants/:variantId", upload.single("image"), adminProductCtrl.updateVariant);
router.delete("/:id/variants/:variantId", adminProductCtrl.removeVariant);

module.exports = router;
