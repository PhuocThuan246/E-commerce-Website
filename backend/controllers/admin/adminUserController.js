const User = require("../../models/User");

// Chỉ lấy user (ẩn password, sort theo tên)
const getAll = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }, "-password").sort({ fullName: 1 });
    res.json(users);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng" });
  }
};

// Cập nhật thông tin cơ bản (whitelist field)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = (({ fullName, email, address, isBanned }) => ({
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(isBanned !== undefined && { isBanned }),
    }))(req.body);

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "user" }, // không cho chỉnh admin
      { $set: payload },
      { new: true, projection: "-password" }
    );

    if (!updated) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật người dùng" });
  }
};


// Ban
const ban = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { $set: { isBanned: true } },
      { new: true, projection: "-password" }
    );
    if (!updated) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Lỗi khi ban người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi ban người dùng" });
  }
};


// Unban
const unban = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { $set: { isBanned: false } },
      { new: true, projection: "-password" }
    );
    if (!updated) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Lỗi khi unban người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi unban người dùng" });
  }
};



module.exports = { getAll, update, ban, unban };
