const express = require("express");
const router = express.Router();
const adminProductCtrl = require("../../controllers/admin/adminProductController");

// CRUD
router.get("/", adminProductCtrl.getAll);
router.post("/", adminProductCtrl.create);
router.put("/:id", adminProductCtrl.update);
router.delete("/:id", adminProductCtrl.remove);


// Biến thể
router.post("/:id/variants", adminProductCtrl.addVariant);
router.put("/:id/variants/:variantId", adminProductCtrl.updateVariant);
router.delete("/:id/variants/:variantId", adminProductCtrl.removeVariant);



module.exports = router;
