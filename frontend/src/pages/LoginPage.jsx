import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
// Google
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sessionId = localStorage.getItem("sessionId");
      const { data } = await authService.login({ ...form, sessionId });

      // Lưu thông tin đăng nhập
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Cập nhật Header ngay
      window.dispatchEvent(new Event("storage"));

      // Phân quyền điều hướng
      if (data.user.role === "admin") {
        toast.success("Chào mừng quản trị viên!");
        setTimeout(() => navigate("/admin"), 700); // trễ nhẹ cho toast
      } else {
        toast.success("Đăng nhập thành công!");
        setTimeout(() => navigate("/"), 700);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Sai thông tin đăng nhập");
    }
  };


  // Google
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const sessionId = localStorage.getItem("sessionId");

      const { data } = await authService.googleLogin({
        token: credentialResponse.credential,
        sessionId,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("storage"));

      toast.success("Đăng nhập Google thành công!");
      navigate("/");
    } catch (err) {
      toast.error("Google Login thất bại");
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
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
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
          🔐 Đăng nhập tài khoản
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
            Đăng nhập
          </button>

          {/* GOOGLE LOGIN */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google Login lỗi")}
            />
          </div>


        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link
            to="/forgot-password"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            Quên mật khẩu?
          </Link>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}
