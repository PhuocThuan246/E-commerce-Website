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

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    try {
      await api.post("/auth/address", form);
      onAdded();       // reload danh sách
      onClose();       // đóng modal
    } catch (err) {
      console.error(err);
      alert("Không thể thêm địa chỉ!");
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Thêm địa chỉ giao hàng</h3>

      <input
        style={styles.input}
        placeholder="Họ tên người nhận"
        value={form.fullName}
        onChange={(e) => handleChange("fullName", e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Số điện thoại"
        value={form.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Tỉnh / Thành phố"
        value={form.city}
        onChange={(e) => handleChange("city", e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Phường / Xã"
        value={form.ward}
        onChange={(e) => handleChange("ward", e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Số nhà - Tên đường"
        value={form.street}
        onChange={(e) => handleChange("street", e.target.value)}
      />

      <label style={styles.checkboxBox}>
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => handleChange("isDefault", e.target.checked)}
        />
        <span>Đặt làm địa chỉ mặc định</span>
      </label>

      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <button style={styles.btnPrimary} onClick={submit}>
          Lưu
        </button>

        <button style={styles.btnGray} onClick={onClose}>
          Hủy
        </button>
      </div>
    </div>
  );
}

/* ================== STYLE ================== */

const styles = {
  card: {
    background: "white",
    borderRadius: 20,
    padding: 24,
    border: "1px solid #fee2e2",
    boxShadow: "0 15px 35px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: "100%",
    maxWidth: 420,
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#dc2626",
    marginBottom: 6,
  },

  input: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 15,
    outline: "none",
  },

  checkboxBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#374151",
    marginTop: 6,
  },

  btnPrimary: {
    background: "linear-gradient(135deg,#dc2626,#b91c1c)",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 600,
    cursor: "pointer",
    flex: 1,
  },

  btnGray: {
    background: "#f1f5f9",
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 600,
    cursor: "pointer",
    color: "#475569",
    flex: 1,
  },
};
