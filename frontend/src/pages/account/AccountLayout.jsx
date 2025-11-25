import { Outlet, Link, useLocation } from "react-router-dom";

export default function AccountLayout() {
  const location = useLocation();

  const linkStyle = (path) => ({
    padding: "14px 16px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 15,
    color: location.pathname === path ? "#0f172a" : "#475569",
    background:
      location.pathname === path
        ? "linear-gradient(135deg,#e2e8f0,#f8fafc)"
        : "transparent",
    boxShadow:
      location.pathname === path
        ? "0 4px 16px rgba(0,0,0,0.08)"
        : "none",
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
    margin: "50px auto",
    background: "#f8fafc",
    padding: 30,
    borderRadius: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },
  sidebar: {
    width: 280,
    paddingRight: 30,
    borderRight: "1px solid #e5e7eb",
  },
  title: {
    marginBottom: 25,
    fontSize: 18,
    color: "#0f172a",
  },
  content: {
    flex: 1,
    paddingLeft: 40,
  },
};
