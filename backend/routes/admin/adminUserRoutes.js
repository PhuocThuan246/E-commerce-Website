const express = require("express");
const router = express.Router();

const adminUserController = require("../../controllers/admin/adminUserController");

// ============ USERS ============
router.get("/", adminUserController.getAll);
router.delete("/:id", adminUserController.remove);

module.exports = router;
