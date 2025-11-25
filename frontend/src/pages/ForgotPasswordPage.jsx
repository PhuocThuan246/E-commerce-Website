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
        background: "linear-gradient(to right, #eff6ff, #f9fafb)",
      }}
    >
      <form
        onSubmit={sendOtp}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{
          textAlign: "center",
          color: "#2563eb",
          fontWeight: "700",
          marginBottom: "25px",
        }}>
          🔑 Quên mật khẩu
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            }}
          >
            Gửi mã OTP
          </button>
        </div>

        <p style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          Nhớ mật khẩu rồi?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: 500 }}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
