import React, { useState } from "react";
import api from "../../services/api";

export default function AddAddressForm({ onAdded, onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    ward: "",
    street: "",
    isDefault: false,
  });

  const submit = async () => {
    await api.post("/auth/address", form);
    onAdded();
    onClose();
  };

  return (
    <div style={card}>
      <h3 style={title}>➕ Thêm địa chỉ giao hàng</h3>

      <input
        style={input}
        placeholder="Họ tên người nhận"
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <input
        style={input}
        placeholder="Số điện thoại"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        style={input}
        placeholder="Tỉnh / Thành phố"
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />
      <input
        style={input}
        placeholder="Phường / Xã"
        onChange={(e) => setForm({ ...form, ward: e.target.value })}
      />
      <input
        style={input}
        placeholder="Số nhà - Tên đường"
        onChange={(e) => setForm({ ...form, street: e.target.value })}
      />

      <label style={checkboxBox}>
        <input
          type="checkbox"
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
        />
        <span>Đặt làm địa chỉ mặc định</span>
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={btnPrimary} onClick={submit}>Lưu</button>
        <button style={btnGray} onClick={onClose}>Hủy</button>
      </div>
    </div>
  );
}

/* ===== STYLE ===== */

const card = {
  background: "white",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const title = {
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a",
};

const input = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontSize: 15,
  outline: "none",
};

const checkboxBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
};

const btnPrimary = {
  background: "linear-gradient(135deg,#0f172a,#334155)",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const btnGray = {
  background: "#f1f5f9",
  border: "none",
  padding: "12px 18px",
  borderRadius: 14,
  fontWeight: 600,
  cursor: "pointer",
  color: "#64748b",
};
