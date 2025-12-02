import { Outlet, Link, useLocation } from "react-router-dom";

export default function AccountLayout() {
  const location = useLocation();

  const linkStyle = (path) => ({
    padding: "14px 16px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 15,
    color: location.pathname === path ? "#b91c1c" : "#475569",
    background:
      location.pathname === path ? "#fef2f2" : "transparent",
    border: location.pathname === path ? "1px solid #fecaca" : "1px solid transparent",
    transition: "all 0.25s ease",
  });


  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3 style={styles.title}>👤 Tài khoản của tôi</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/account/profile" style={linkStyle("/account/profile")}>
            Thông tin cá nhân
          </Link>
          <Link to="/account/addresses" style={linkStyle("/account/addresses")}>
            Địa chỉ giao hàng
          </Link>
          <Link to="/account/orders" style={linkStyle("/account/orders")}>
            Đơn hàng của tôi
          </Link>

          <Link to="/account/change-password" style={linkStyle("/account/change-password")}>
            Đổi mật khẩu
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    maxWidth: 1200,
    margin: "40px auto",
    background: "#ffffff",
    padding: 30,
    borderRadius: 24,
    boxShadow: "0 15px 40px rgba(0,0,0,0.06)",
    gap: 40,
  },
  sidebar: {
    width: 260,
    paddingRight: 30,
    borderRight: "2px solid #f1f5f9",
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 700,
    color: "#dc2626",
  },
  content: {
    flex: 1,
    paddingLeft: 10,
  },
};
