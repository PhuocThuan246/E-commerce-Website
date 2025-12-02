import React, { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      localStorage.setItem("resetEmail", email);
      toast.success("Đã gửi mã OTP về email!");
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Không gửi được mã");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#ffffff",              // NỀN TRẮNG
        padding: "20px",
      }}
    >
      <form
        onSubmit={sendOtp}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* ==== TIÊU ĐỀ (đỏ đồng bộ header) ==== */}
        <h2
          style={{
            textAlign: "center",
            color: "#dc2626",          // MÀU ĐỎ HEADER
            fontWeight: 700,
            marginBottom: 25,
            fontSize: 24,
          }}
        >
          Quên mật khẩu
        </h2>

        {/* ==== INPUT ==== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              outline: "none",
              transition: "0.2s ease",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #2563eb")}
            onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
          />

          {/* ==== BUTTON ==== */}
          <button
            type="submit"
            style={{
              background: "#dc2626",              // 🔴 MÀU ĐỎ CHÍNH
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.25s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#b91c1c")} // 🔴 ĐỎ ĐẬM
            onMouseOut={(e) => (e.target.style.background = "#dc2626")}
          >
            Gửi mã OTP
          </button>

        </div>

        {/* ==== LINK TRỞ LẠI ==== */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Nhớ mật khẩu rồi?{" "}
          <Link
            to="/login"
            style={{
              color: "#dc2626",
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
