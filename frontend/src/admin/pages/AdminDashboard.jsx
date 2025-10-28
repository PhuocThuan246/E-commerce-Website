import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Sản phẩm",
      color: "#3b82f6",
      icon: "💻",
      link: "/admin/products",
    },
    {
      title: "Danh mục",
      color: "#10b981",
      icon: "🏷️",
      link: "/admin/categories",
    },
    {
      title: "Đơn hàng",
      color: "#f59e0b",
      icon: "📦",
      link: "/admin/orders",
    },
    {
      title: "Người dùng",
      color: "#14a248ff",
      icon: "👥",
      link: "/admin/users",
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
        Xin chào <strong>Admin</strong> 👋 — Dưới đây là tổng quan hệ thống.
      </p>

      {/* Cards thống kê */}
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
              background: "white",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            }}
          >
            <div
              style={{
                background: s.color,
                color: "white",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 14,
              }}
            >
              {s.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: 18 }}>{s.title}</h3>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: s.color,
                margin: "8px 0 0",
              }}
            >
            </p>
          </Link>
        ))}
      </div>

      {/* Placeholder biểu đồ */}
      <div
        style={{
          marginTop: 40,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ color: "#111827" }}>📈 Doanh thu gần đây</h2>
        <p style={{ color: "#6b7280" }}>
          (Tính năng biểu đồ sẽ được bổ sung sau)
        </p>
        <div
          style={{
            height: 220,
            borderRadius: 8,
            background:
              "repeating-linear-gradient(90deg, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 40px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            padding: "0 20px",
          }}
        >
          {[60, 90, 120, 80, 100, 70, 130].map((h, i) => (
            <div
              key={i}
              style={{
                width: 20,
                height: h,
                background: "#3b82f6",
                borderRadius: 4,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
