const express = require("express");
const router = express.Router();

const adminUserController = require("../../controllers/admin/adminUserController");

// ============ USERS ============
router.get("/", adminUserController.getAll);
router.patch("/:id", adminUserController.update);       // cập nhật
router.patch("/:id/ban", adminUserController.ban);      // ban
router.patch("/:id/unban", adminUserController.unban);  // unban

module.exports = router;
