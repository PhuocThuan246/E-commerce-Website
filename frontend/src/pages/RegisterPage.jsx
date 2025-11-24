import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    ward: "",
    street: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sessionId = localStorage.getItem("sessionId");

      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        sessionId,

        // ✅ tạo địa chỉ đầy đủ mặc định
        addresses: [
          {
            fullName: form.fullName,
            phone: form.phone,
            city: form.city,
            ward: form.ward,
            street: form.street,
            isDefault: true,
          },
        ],
      };

      const { data } = await authService.register(payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đăng ký");
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(to right, #eff6ff, #f9fafb)",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "450px",
      }}>
        <h2 style={{
          textAlign: "center",
          color: "#2563eb",
          fontWeight: "700",
          marginBottom: "25px",
        }}>
          📝 Tạo tài khoản mới
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            placeholder="Họ và tên"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Tỉnh / Thành phố"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Phường / Xã"
            value={form.ward}
            onChange={(e) => setForm({ ...form, ward: e.target.value })}
          />

          <input
            type="text"
            placeholder="Địa chỉ chi tiết (số nhà, đường...)"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "600",
            marginTop: "10px",
          }}>
            Đăng ký ngay
          </button>
        </div>

        <p style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: 500 }}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
