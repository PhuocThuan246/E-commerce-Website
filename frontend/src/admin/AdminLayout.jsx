import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Đã đăng xuất khỏi tài khoản quản trị!");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        color: "#111827",
        transition: "all 0.3s ease",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 70,
          background: "#111827",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div>
          {/* Logo + Toggle */}
          <div
            style={{
              padding: "20px 16px",
              fontSize: 20,
              fontWeight: "bold",
              borderBottom: "1px solid #1f2937",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "space-between" : "center",
            }}
          >
            {sidebarOpen && (
              <>
                🛍️ <span style={{ color: "#60a5fa" }}>E-Shop Admin</span>
              </>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ☰
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ padding: 20 }}>
            {[
              ["🏠", "Trang chủ", "/admin"],
              ["📦", "Sản phẩm", "/admin/products"],
              ["🏷️", "Danh mục", "/admin/categories"],
              ["📋", "Đơn hàng", "/admin/orders"],
              ["💸", "Mã giảm giá", "/admin/discounts"], 
              ["👥", "Người dùng", "/admin/users"],
              ["📊", "Bảng điều khiển", "/admin/dashboard/simple"],
              ["📈", "Phân tích nâng cao", "/admin/dashboard/advanced"],
            ].map(([icon, label, link]) => (
              <Link
                key={link}
                to={link}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "white",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 6,
                  background: "transparent",
                  fontSize: 15,
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#1f2937")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {sidebarOpen && label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div style={{ padding: 20, borderTop: "1px solid #1f2937" }}>
          {sidebarOpen && (
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "white",
                background: "#2563eb",
                padding: "8px 14px",
                borderRadius: 8,
                display: "block",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              ← Trang khách hàng
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: "block",
              width: "100%",
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "600",
              fontSize: 14,
              textAlign: "center",
            }}
            onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
            onMouseOut={(e) => (e.target.style.background = "#dc2626")}
          >
            🚪 {sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 40,
          transition: "margin-left 0.3s ease",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            padding: 30,
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
