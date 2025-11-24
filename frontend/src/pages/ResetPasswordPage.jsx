import React, { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const email = localStorage.getItem("resetEmail");
  const navigate = useNavigate();

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      localStorage.removeItem("resetEmail");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #dbeafe, #f8fafc)",
      }}
    >
      <form
        onSubmit={resetPassword}
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
          🔄 Đặt lại mật khẩu
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "15px",
            }}
          />

          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            Xác nhận đổi mật khẩu
          </button>
        </div>

        <p style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          Quay lại?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: 500 }}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
