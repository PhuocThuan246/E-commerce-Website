const User = require("../../models/User");

// Lấy tất cả người dùng
const getAll = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ fullName: 1 }); // ẩn password
    res.json(users);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng" });
  }
};

// Xóa người dùng
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi xóa người dùng" });
  }
};

module.exports = { getAll, remove };
