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
      toast.success("🎉 Đăng ký thành công!");
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
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f9fafb 50%, #e0f2fe 100%)",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "45px 40px",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
          width: "100%",
          maxWidth: "460px",
          transition: "all 0.3s ease",
        }}
      >
        {/* --- Tiêu đề --- */}
        <h2
          style={{
            textAlign: "center",
            color: "#1d4ed8",
            fontWeight: "800",
            marginBottom: "25px",
            letterSpacing: "0.3px",
          }}
        >
          Đăng ký tài khoản
        </h2>

        {/* --- Input form --- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {[
            { key: "fullName", placeholder: "Họ và tên" },
            { key: "email", placeholder: "Email", type: "email" },
            { key: "phone", placeholder: "Số điện thoại" },
            { key: "city", placeholder: "Tỉnh / Thành phố" },
            { key: "ward", placeholder: "Phường / Xã" },
            { key: "street", placeholder: "Địa chỉ chi tiết (số nhà, đường...)" },
            { key: "password", placeholder: "Mật khẩu", type: "password" },
          ].map((f) => (
            <input
              key={f.key}
              type={f.type || "text"}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              required={
                ["ward", "street"].includes(f.key) ? false : true
              }
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                outline: "none",
                fontSize: "15px",
                transition: "0.2s ease",
              }}
              onFocus={(e) =>
                (e.target.style.border = "1.5px solid #2563eb")
              }
              onBlur={(e) =>
                (e.target.style.border = "1.5px solid #d1d5db")
              }
            />
          ))}

          {/* --- Nút đăng ký --- */}
          <button
            type="submit"
            style={{
              background:
                "linear-gradient(90deg, #2563eb, #1d4ed8)",
              color: "white",
              border: "none",
              padding: "13px",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
              marginTop: "10px",
              transition: "0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background =
                "linear-gradient(90deg, #1e40af, #1d4ed8)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                "linear-gradient(90deg, #2563eb, #1d4ed8)")
            }
          >
            Đăng ký ngay
          </button>
        </div>

        {/* --- Link đăng nhập --- */}
        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              fontWeight: 600,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
