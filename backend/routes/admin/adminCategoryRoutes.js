const express = require("express");
const router = express.Router();
const adminCategoryCtrl = require("../../controllers/admin/adminCategoryController");

// CRUD
router.get("/", adminCategoryCtrl.getAll);
router.post("/", adminCategoryCtrl.create);
router.put("/:id", adminCategoryCtrl.update);
router.delete("/:id", adminCategoryCtrl.remove);

module.exports = router;
