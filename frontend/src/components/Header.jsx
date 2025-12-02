import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import productService from "../services/productService";
import "../styles/searchPopup.css";
import { SERVER_URL } from "../services/api";

// Hàm build URL ảnh chuẩn (dùng cùng logic ProductDetail.jsx)
const buildImageUrl = (path) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${SERVER_URL}${path}`;
  return `${SERVER_URL}/${path}`;
};

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isFocusSearch, setIsFocusSearch] = useState(false);
  const navigate = useNavigate();

  // ================== CART & USER ==================
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

  // ================== LOAD SẢN PHẨM ==================
  useEffect(() => {
    (async () => {
      try {
        const { data } = await productService.getAll();
        setAllProducts(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      }
    })();
  }, []);

  // ================== LỌC REALTIME ==================
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    const lower = query.toLowerCase();
    const matched = allProducts
      .filter((p) => p.name.toLowerCase().includes(lower))
      .slice(0, 6);
    setResults(matched);
  }, [query, allProducts]);

  // ================== CLICK SẢN PHẨM ==================
  const handleClickProduct = (id) => {
    setQuery("");
    setResults([]);
    setIsFocusSearch(false);
    navigate(`/product/${id}`);
  };

  // ================== LOGOUT ==================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    navigate("/");
  };

  const firstChar = (user?.fullName || user?.name || "U")[0].toUpperCase();

  // ================== UI ==================
  return (
    <header style={styles.header}>
      {/* LOGO */}
      <div style={styles.leftGroup}>
        <Link to="/" style={styles.logo}>
          <img
            src="banners/logo.png"
            alt="E-Shop"
            style={{ width: 38, height: 38, marginRight: 10 }}
          />
          <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
            E-Shop
          </span>
        </Link>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>
            Trang chủ
          </Link>
          <Link to="/products" style={styles.navLink}>
            Sản phẩm
          </Link>
        </nav>
      </div>

      {/* Ô tìm kiếm */}
      <div style={styles.searchWrapper}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Bạn cần tìm gì?"
            value={query}
            onFocus={() => setIsFocusSearch(true)}
            onBlur={() => setTimeout(() => setIsFocusSearch(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.searchBtn}>🔍</button>
        </div>

        {isFocusSearch && results.length > 0 && (
          <div className="search-popup">
            {results.map((p) => {
              const firstImg =
                (p.variants?.[0]?.images?.[0]) ||
                (p.images?.[0]) ||
                p.image ||
                null;

              return (
                <div
                  key={p._id}
                  className="search-item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleClickProduct(p._id)}
                >
                  <img
                    src={buildImageUrl(firstImg)}
                    alt={p.name}
                    className="search-img"
                  />
                  <div className="search-info">
                    <div className="search-name">{p.name}</div>
                    <div className="search-prices">
                      <span className="price-new">
                        {(p.effectivePrice ?? p.price).toLocaleString()}₫
                      </span>
                      {p.oldPrice && (
                        <span className="price-old">
                          {p.oldPrice.toLocaleString()}₫
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NHÓM PHẢI */}
      <div style={styles.rightGroup}>
        <div style={styles.infoItem}>
          <span style={styles.icon}>📞</span>
          <div>
            <div style={styles.infoLabel}>Hotline</div>
            <div style={styles.infoValue}>1900.5301</div>
          </div>
        </div>

        <Link
          to="/cart"
          style={styles.cartBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#b91c1c";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#dc2626";
          }}
        >
          🛒 Giỏ hàng
          {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
        </Link>

        {user ? (
          <div style={{ position: "relative" }}>
            <div style={styles.userBox} onClick={() => setShowMenu(!showMenu)}>
              <div style={styles.avatar}>{firstChar}</div>
              <span style={styles.username}>{user.fullName || user.name}</span>
            </div>

            {showMenu && (
              <div style={styles.dropdown}>
                <Link to="/account/profile" style={styles.menuItem}>
                  Tài khoản của tôi
                </Link>
                <Link to="/account/orders" style={styles.menuItem}>
                  Đơn hàng của tôi
                </Link>
                <div
                  onClick={logout}
                  style={{ ...styles.menuItem, color: "#ef4444" }}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={styles.loginBtn}>
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}

// ================== STYLE ==================
const styles = {
  header: {
    background: "#dc2626",
    color: "white",
    padding: "10px 50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  leftGroup: { display: "flex", alignItems: "center", gap: 20 },
  logo: { display: "flex", alignItems: "center", textDecoration: "none" },
  nav: { display: "flex", alignItems: "center", gap: 18 },
  navLink: { textDecoration: "none", color: "white", fontWeight: 600 },
  searchWrapper: { position: "relative", flex: 1, maxWidth: 400 },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: 6,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 12px",
    fontSize: 15,
  },
  searchBtn: {
    background: "none",
    border: "none",
    padding: "10px 14px",
    fontSize: 16,
    cursor: "pointer",
  },
  rightGroup: { display: "flex", alignItems: "center", gap: 20 },
  infoItem: { display: "flex", alignItems: "center", gap: 6 },
  icon: { fontSize: 18 },
  infoLabel: { fontSize: 11, opacity: 0.9 },
  infoValue: { fontSize: 13, fontWeight: 600 },
  cartBtn: {
    position: "relative",
    background: "#fff",
    color: "#dc2626",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "0.25s",
    cursor: "pointer",
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
    border: "2px solid white",
  },
  userBox: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  username: { fontWeight: 600, color: "white" },
  dropdown: {
    position: "absolute",
    top: "120%",
    right: 0,
    background: "white",
    borderRadius: 10,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    minWidth: 200,
    overflow: "hidden",
  },
  menuItem: {
    padding: "12px 16px",
    display: "block",
    textDecoration: "none",
    color: "#111827",
    borderBottom: "1px solid #f3f4f6",
  },
  loginBtn: {
    background: "white",
    color: "#dc2626",
    padding: "8px 16px",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
  },
};
