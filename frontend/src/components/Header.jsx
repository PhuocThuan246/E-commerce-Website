import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  const fetchCartCount = async () => {
    try {
      const { data } = await cartService.getCart();
      const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch {}
  };

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

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    navigate("/");
  };

  const firstChar = (user?.fullName || user?.name || "U")[0].toUpperCase();

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>E-Shop</Link>

      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Trang chủ</Link>
        <Link to="/products" style={styles.link}>Sản phẩm</Link>


        {user ? (
          <div style={{ position: "relative" }} ref={menuRef}>
            <div style={styles.userBox} onClick={() => setShowMenu(!showMenu)}>
              <div style={styles.avatar}>{firstChar}</div>
              <span style={styles.username}>{user.fullName || user.name}</span>
            </div>

            {showMenu && (
              <div style={styles.dropdown}>
                <Link to="/account/profile" style={styles.menuItem}>Tài khoản của tôi</Link>
                <Link to="/orders" style={styles.menuItem}>Đơn hàng</Link>
                <div onClick={logout} style={{ ...styles.menuItem, color: "#ef4444" }}>
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Đăng nhập</Link>
            <Link to="/register" style={styles.link}>Đăng ký</Link>
          </>
        )}

        <Link
          to="/cart"
          style={styles.cart}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1f2937";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111827";
          }}
        >
          <span style={{ fontSize: 18 }}>🛒</span>
          Giỏ hàng
          {cartCount > 0 && (
            <span style={styles.badge}>{cartCount}</span>
          )}
        </Link>



      </nav>
    </header>
  );
}

const styles = {
  header: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(14px)",
    padding: "16px 60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid #e5e7eb"
  },
  logo: {
    fontSize: 22,
    fontWeight: 800,
    textDecoration: "none",
    color: "#111827",
    letterSpacing: 1
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 26
  },
  link: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 600,
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#0f172a,#475569)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: 16
  },
  username: {
    color: "#111827",
    fontWeight: 600
  },
  dropdown: {
    position: "absolute",
    top: "130%",
    right: 0,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    minWidth: 220,
    overflow: "hidden"
  },
  menuItem: {
    padding: "14px 18px",
    display: "block",
    textDecoration: "none",
    color: "#111827",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6"
  },
  cart: {
    textDecoration: "none",
    background: "#111827",
    color: "white",
    padding: "8px 18px",
    borderRadius: 999,
    fontWeight: 600,
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    transition: "all 0.25s ease",
  },

  badge: {
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    minWidth: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    position: "absolute",
    top: "-6px",
    right: "-6px",
    border: "2px solid white"
  }



};
