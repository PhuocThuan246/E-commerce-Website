import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sessionId = localStorage.getItem("sessionId");
      const { data } = await authService.login({ ...form, sessionId });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      toast.success("Đăng nhập thành công!");
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sai thông tin đăng nhập");
    }
  };

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
    } catch {
      toast.error("Google Login thất bại");
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
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            marginBottom: 25,
            color: "#dc2626",
          }}
        >
          Đăng nhập
        </h2>


        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
          />

          <button
            type="submit"
            style={submitBtn}
            onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
            onMouseOut={(e) => (e.target.style.background = "#dc2626")}
          >
            Đăng nhập
          </button>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <GoogleLogin onSuccess={handleGoogleLogin} />
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link to="/forgot-password" style={linkRed}>
            Quên mật khẩu?
          </Link>
        </div>

        <p style={bottomText}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={linkRed}>
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  border: "1.5px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 15,
  outline: "none",
};

const submitBtn = {
  background: "#dc2626",
  color: "white",
  padding: "12px",
  borderRadius: 8,
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 4,
};

const linkRed = { color: "#dc2626", textDecoration: "none", fontWeight: 500 };

const bottomText = {
  marginTop: 20,
  textAlign: "center",
  fontSize: 14,
  color: "#6b7280",
};
