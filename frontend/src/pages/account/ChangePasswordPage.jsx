import React, { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const submit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Sai mật khẩu cũ");
    }
  };

  return (
    <div style={card}>
      <h2 style={title}>Đổi mật khẩu</h2>

      <input
        style={input}
        type="password"
        placeholder="Mật khẩu hiện tại"
        onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
      />

      <input
        style={input}
        type="password"
        placeholder="Mật khẩu mới"
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
      />

      <input
        style={input}
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        onChange={(e) =>
          setForm({ ...form, confirmPassword: e.target.value })
        }
      />

      <button style={btnDanger} onClick={submit}>
        Cập nhật mật khẩu
      </button>
    </div>
  );
}

/* ===== STYLE ===== */

const card = {
  background: "white",
  borderRadius: 20,
  padding: 26,
  border: "1px solid #fee2e2",
  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const title = {
  fontSize: 22,
  marginBottom: 10,
  fontWeight: 700,
  color: "#dc2626",
};

const input = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontSize: 15,
  outline: "none",
};

const btnDanger = {
  background: "linear-gradient(135deg,#dc2626,#b91c1c)",
  color: "white",
  padding: "14px",
  borderRadius: 14,
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
};

