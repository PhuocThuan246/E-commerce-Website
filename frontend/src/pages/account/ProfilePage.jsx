import React, { useEffect, useState } from "react";
import authService from "../../services/authService";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    authService.profile()
      .then(res => {
        setProfile({
          fullName: res.data.fullName,
          email: res.data.email,
        });
      })
      .catch(() => toast.error("Bạn chưa đăng nhập"));
  }, []);

  const updateProfile = async () => {
    try {
      await authService.updateProfile({ fullName: profile.fullName });
      toast.success("Cập nhật thành công!");
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div>
      <h2 style={title}>Thông tin cá nhân</h2>

      <div style={card}>
        {/* EMAIL - CHỈ XEM */}
        <input
          style={{ ...input, background: "#f1f5f9", cursor: "not-allowed" }}
          value={profile.email}
          disabled
        />

        {/* HỌ TÊN - ĐƯỢC SỬA */}
        <input
          style={input}
          placeholder="Họ tên"
          value={profile.fullName}
          onChange={(e) =>
            setProfile({ ...profile, fullName: e.target.value })
          }
        />

        <button style={btn} onClick={updateProfile}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

const title = {
  fontSize: 24,
  marginBottom: 20,
  color: "#dc2626",
  fontWeight: 700,
};

const card = {
  background: "white",
  padding: 26,
  borderRadius: 20,
  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  border: "1px solid #fee2e2",
};

const input = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontSize: 15,
  outline: "none",
};

const btn = {
  background: "linear-gradient(135deg,#dc2626,#b91c1c)",
  color: "white",
  padding: "14px",
  borderRadius: 14,
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 10,
};

