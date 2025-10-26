import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sessionId = localStorage.getItem("sessionId");
      const { data } = await authService.register({ ...form, sessionId });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đăng ký");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #eff6ff, #f9fafb)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "450px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2563eb",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          📝 Tạo tài khoản mới
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            placeholder="Họ và tên"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "15px",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "15px",
            }}
          />
          <input
            type="text"
            placeholder="Địa chỉ giao hàng"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "15px",
            }}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
              marginTop: "10px",
            }}
            onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseOut={(e) => (e.target.style.background = "#2563eb")}
          >
            Đăng ký ngay
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
