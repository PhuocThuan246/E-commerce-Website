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
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: 40,
          borderRadius: 10,
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 460,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            marginBottom: 26,
            color: "#dc2626",
          }}
        >
          Tạo tài khoản
        </h2>


        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "fullName", placeholder: "Họ và tên" },
            { key: "email", placeholder: "Email", type: "email" },
            { key: "phone", placeholder: "Số điện thoại" },
            { key: "city", placeholder: "Tỉnh / Thành phố" },
            { key: "ward", placeholder: "Phường / Xã" },
            { key: "street", placeholder: "Địa chỉ" },
            { key: "password", placeholder: "Mật khẩu", type: "password" },
          ].map((f) => (
            <input
              key={f.key}
              type={f.type || "text"}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              style={inputBox}
            />
          ))}

          <button
            type="submit"
            style={submitBtn}
            onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
            onMouseOut={(e) => (e.target.style.background = "#dc2626")}
          >
            Đăng ký
          </button>
        </div>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          Đã có tài khoản?{" "}
          <Link to="/login" style={linkRed}>
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputBox = {
  padding: 12,
  border: "1.5px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 15,
};

const submitBtn = {
  background: "#dc2626",
  color: "white",
  padding: 12,
  borderRadius: 8,
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
};

const linkRed = { color: "#dc2626", textDecoration: "none", fontWeight: 600 };
