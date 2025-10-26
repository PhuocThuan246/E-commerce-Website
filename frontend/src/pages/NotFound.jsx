import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: 100,
        minHeight: "80vh",
        background: "#f9fafb",
        color: "#111827",
      }}
    >
      <h1 style={{ fontSize: 72, color: isAdmin ? "#dc2626" : "#2563eb" }}>404</h1>
      <h2 style={{ fontWeight: 600, marginBottom: 10 }}>
        {isAdmin
          ? "Không tìm thấy trang quản trị 🚫"
          : "Trang bạn tìm không tồn tại 😢"}
      </h2>
      <p style={{ color: "#6b7280", marginBottom: 30 }}>
        {isAdmin
          ? "Đường dẫn bạn nhập không đúng hoặc trang này đã bị xóa khỏi khu vực quản trị."
          : "Có thể bạn đã nhập sai đường dẫn hoặc trang này đã bị xóa."}
      </p>

      <Link
        to={isAdmin ? "/admin" : "/"}
        style={{
          background: isAdmin ? "#dc2626" : "#2563eb",
          color: "white",
          padding: "10px 18px",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        ← Quay lại {isAdmin ? "Bảng điều khiển" : "Trang chủ"}
      </Link>
    </div>
  );
}
