import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const stats = [
    { title: "Trang chủ", icon: "🏠", color: "#2563eb", link: "/admin" },
    { title: "Sản phẩm", icon: "📦", color: "#3b82f6", link: "/admin/products" },
    { title: "Danh mục", icon: "🏷️", color: "#10b981", link: "/admin/categories" },
    { title: "Đơn hàng", icon: "📋", color: "#f59e0b", link: "/admin/orders" },
    { title: "Mã giảm giá", icon: "💸", color: "#ef4444", link: "/admin/discounts" },
    { title: "Người dùng", icon: "👥", color: "#14a248", link: "/admin/users" },
    {
      title: "Bảng điều khiển",
      icon: "📊",
      color: "#6366f1",
      link: "/admin/dashboard/simple",
    },
    {
      title: "Phân tích nâng cao",
      icon: "📈",
      color: "#8b5cf6",
      link: "/admin/dashboard/advanced",
    },
  ];

  return (
    <div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 10,
          color: "#111827",
        }}
      >
        📊 Bảng điều khiển quản trị
      </h1>

      <p style={{ color: "#6b7280", marginBottom: 30 }}>
        Xin chào <strong>Admin</strong> 👋 — Chọn nhanh chức năng quản trị bên dưới
      </p>

      {/* DASHBOARD NAVIGATION CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {stats.map((s, i) => (
        <Link
          key={i}
          to={s.link}
          style={{
            textDecoration: "none",
            color: "inherit",
            background: `linear-gradient(145deg, #ffffff, ${s.color}15)`,
            borderRadius: 16,
            border: `1px solid ${s.color}40`,
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 18,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            transition: "all 0.25s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
            e.currentTarget.style.boxShadow = `0 10px 25px ${s.color}55`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)";
          }}
        >
          {/* Glow background */}
          <div
            style={{
              position: "absolute",
              right: -20,
              top: -20,
              width: 120,
              height: 120,
              background: s.color,
              opacity: 0.15,
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />

          {/* Icon */}
          <div
            style={{
              background: s.color,
              color: "white",
              borderRadius: 18,
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: `0 6px 16px ${s.color}66`,
            }}
          >
            {s.icon}
          </div>

          {/* Text */}
          <div style={{ zIndex: 2 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              {s.title}
            </h3>

            <span
              style={{
                fontSize: 13,
                color: "#6b7280",
                background: `${s.color}20`,
                padding: "3px 10px",
                borderRadius: 20,
                display: "inline-block",
                marginTop: 6,
              }}
            >
              Quản lý & điều hướng
            </span>
          </div>
        </Link>

        ))}
      </div>
    </div>
  );
}
