import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin giỏ hàng
  const fetchCartCount = async () => {
    try {
      const { data } = await cartService.getCart();
      const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch (err) {
      console.error("Lỗi khi tải số lượng giỏ hàng:", err);
    }
  };

  // Lấy thông tin user từ localStorage
  const fetchUser = () => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  useEffect(() => {
    fetchCartCount();
    fetchUser();

    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("storage", fetchUser);

    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("storage", fetchUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // CSS style chung
  const linkStyle = {
    textDecoration: "none",
    color: "white",
    fontWeight: 500,
    transition: "color 0.2s",
  };

  const activeStyle = {
    color: "#60a5fa",
    fontWeight: 600,
  };

  return (
    <header
      style={{
        background: "#111827",
        color: "white",
        padding: "14px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "white",
          fontSize: 24,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🛍️ <span style={{ color: "#60a5fa" }}>E-Shop</span>
      </Link>

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Link
          to="/"
          style={{
            ...linkStyle,
            ...(location.pathname === "/" ? activeStyle : {}),
          }}
        >
          Trang chủ
        </Link>

        <Link
          to="/orders"
          style={{
            ...linkStyle,
            ...(location.pathname === "/orders" ? activeStyle : {}),
          }}
        >
          Đơn hàng
        </Link>

       

        {/* Khu vực user */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#9ca3af" }}>👋 {user.fullName || user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/login" style={linkStyle}>
              Đăng nhập
            </Link>
            <Link to="/register" style={linkStyle}>
              Đăng ký
            </Link>
          </div>
        )}

         {/* Giỏ hàng */}
        <Link
          to="/cart"
          style={{
            textDecoration: "none",
            background: "#2563eb",
            color: "white",
            padding: "8px 14px",
            borderRadius: 8,
            fontWeight: 600,
            position: "relative",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.background = "#2563eb")}
        >
          🛒 Giỏ hàng{" "}
          {cartCount > 0 && (
            <span
              style={{
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 8px",
                fontSize: 12,
                position: "absolute",
                top: "-6px",
                right: "-10px",
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
