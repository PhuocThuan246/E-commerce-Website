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
        background: "#ffffff", // 🔥 NỀN TRẮNG ĐỒNG BỘ
        padding: "20px",
      }}
    >
      <form
        onSubmit={resetPassword}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* TIÊU ĐỀ RED */}
        <h2
          style={{
            textAlign: "center",
            color: "#dc2626", // 🔴 TIÊU ĐỀ MÀU ĐỎ
            fontWeight: 700,
            marginBottom: 25,
          }}
        >
          Đặt lại mật khẩu
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #dc2626") // 🔴 FOCUS BORDER
            }
            onBlur={(e) =>
              (e.target.style.border = "1px solid #d1d5db")
            }
          />

          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #dc2626")
            }
            onBlur={(e) =>
              (e.target.style.border = "1px solid #d1d5db")
            }
          />

          {/* 🔴 NÚT XÁC NHẬN */}
          <button
            type="submit"
            style={{
              background: "#dc2626", // màu đỏ chính
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.25s",
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "#b91c1c") // 🔥 đỏ đậm khi hover
            }
            onMouseOut={(e) =>
              (e.target.style.background = "#dc2626")
            }
          >
            Xác nhận đổi mật khẩu
          </button>
        </div>

        {/* LINK LOGIN MÀU ĐỎ */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Quay lại?{" "}
          <Link
            to="/login"
            style={{
              color: "#dc2626", // 🔴 LINK ĐỎ
              fontWeight: 600,
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.target.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.target.style.textDecoration = "none")
            }
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
