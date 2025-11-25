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
    const user = await User.findById(id);

    if (!user || user.role !== "user")
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.isBanned !== undefined) user.isBanned = req.body.isBanned;

    // ✅ Cập nhật TỈNH của địa chỉ mặc định
    if (req.body.city) {
      const defaultAddress = user.addresses.find(a => a.isDefault);
      if (defaultAddress) {
        defaultAddress.city = req.body.city;
      }
    }

    await user.save();
    res.json({ success: true, user });

  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    res.status(500).json({ message: "Lỗi server" });
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
