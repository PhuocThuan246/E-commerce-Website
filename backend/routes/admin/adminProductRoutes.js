const express = require("express");
const router = express.Router();
const adminProductCtrl = require("../../controllers/admin/adminProductController");
const upload = require("../../middlewares/upload");

// CRUD
router.get("/", adminProductCtrl.getAll);
router.post("/", upload.single("image"), adminProductCtrl.create); 
router.put("/:id", upload.single("image"), adminProductCtrl.update); // thêm upload
router.delete("/:id", adminProductCtrl.remove);


// Biến thể
// Thêm upload ảnh cho biến thể
router.post("/:id/variants", upload.single("image"), adminProductCtrl.addVariant);
router.put("/:id/variants/:variantId", upload.single("image"), adminProductCtrl.updateVariant);
router.delete("/:id/variants/:variantId", adminProductCtrl.removeVariant);



module.exports = router;
