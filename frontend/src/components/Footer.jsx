import React from "react";
import { FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  const socialStyle = {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    transition: "all 0.25s",
    cursor: "pointer",
  };

  const socials = [
    {
      icon: <FaFacebookF />,
      link: "https://facebook.com",
      hoverColor: "#3b82f6",
    },
    {
      icon: <FaInstagram />,
      link: "https://instagram.com",
      hoverColor: "#f472b6",
    },
    {
      icon: <FaGithub />,
      link: "https://github.com",
      hoverColor: "#9ca3af",
    },
  ];

  return (
    <footer
      style={{
        background: "#111827",
        color: "white",
        textAlign: "center",
        padding: "40px 20px",
        marginTop: 60,
        borderTop: "2px solid #2563eb",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo */}
      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 0.3,
        }}
      >
        🛍️ <span style={{ color: "#60a5fa" }}>E-Shop</span>
      </h2>

      {/* Tagline */}
      <p
        style={{
          marginTop: 8,
          color: "#9ca3af",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        Mua sắm dễ dàng — Giao hàng nhanh chóng — Trải nghiệm tuyệt vời
      </p>

      {/* --- Mạng xã hội --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        {socials.map((s, idx) => (
          <a
            key={idx}
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            style={socialStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = s.hoverColor;
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = `0 3px 8px ${s.hoverColor}55`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {s.icon}
          </a>
        ))}
      </div>

      {/* --- Bản quyền --- */}
      <div
        style={{
          marginTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 14,
          color: "#d1d5db",
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>
          © {year} <strong>E-Shop</strong>. Mọi quyền được bảo lưu.
        </p>

        <p style={{ margin: "6px 0 0" }}>
          Phát triển bởi{" "}
          <strong
            style={{
              color: "#60a5fa",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.color = "#93c5fd")}
            onMouseOut={(e) => (e.target.style.color = "#60a5fa")}
          >
            United Team
          </strong>
        </p>
      </div>
    </footer>
  );
}
