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

  const layoutStyle = {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111827",
    transition: "all 0.3s ease",
  };

  const sidebarStyle = {
    width: sidebarOpen ? 240 : 72,
    background: "#111827",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "width 0.3s ease",
    overflow: "hidden",
    boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  };

  const headerStyle = {
    padding: "18px 16px",
    fontSize: 18,
    fontWeight: "bold",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: sidebarOpen ? "space-between" : "center",
    gap: 8,
  };

  const toggleBtnStyle = {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: 22,
    cursor: "pointer",
  };

  const navWrapperStyle = { padding: 20 };

  const linkBaseStyle = {
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
    transition: "background 0.2s ease, transform 0.1s ease",
  };

  const footerStyle = {
    padding: 20,
    borderTop: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  const clientBtnStyle = {
    textDecoration: "none",
    color: "white",
    background: "#2563eb",
    padding: "9px 14px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 14,
  };

  const logoutBtnStyle = {
    width: "100%",
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "9px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 42,
    transition: "background 0.2s ease, transform 0.05s ease",
  };

  const mainStyle = {
    flex: 1,
    padding: 40,
    transition: "margin-left 0.3s ease",
  };

  const contentBoxStyle = {
    background: "white",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    padding: 30,
  };

  const handleNavHoverIn = (e) => {
    e.currentTarget.style.background = "#1f2937";
    e.currentTarget.style.transform = "translateX(2px)";
  };

  const handleNavHoverOut = (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.transform = "translateX(0)";
  };

  const handleLogoutHoverIn = (e) => {
    e.currentTarget.style.background = "#b91c1c";
    e.currentTarget.style.transform = "translateY(1px)";
  };

  const handleLogoutHoverOut = (e) => {
    e.currentTarget.style.background = "#dc2626";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div>
          {/* Logo + Toggle */}
          <div style={headerStyle}>
            {sidebarOpen && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span role="img" aria-label="logo">
                  🛍️
                </span>
                <span style={{ color: "#60a5fa" }}>E-Shop Admin</span>
              </span>
            )}

            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={toggleBtnStyle}
            >
              ☰
            </button>
          </div>

          {/* Navigation */}
          <nav style={navWrapperStyle}>
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
                style={linkBaseStyle}
                onMouseEnter={handleNavHoverIn}
                onMouseLeave={handleNavHoverOut}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {sidebarOpen && <span>{label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div style={footerStyle}>
          {sidebarOpen && (
            <Link to="/" style={clientBtnStyle}>
              ← Trang khách hàng
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={logoutBtnStyle}
            onMouseEnter={handleLogoutHoverIn}
            onMouseLeave={handleLogoutHoverOut}
          >
            <span role="img" aria-label="logout">
              🚪
            </span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={mainStyle}>
        <div style={contentBoxStyle}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
