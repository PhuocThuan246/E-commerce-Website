import React from "react";
import { FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { icon: <FaFacebookF />, link: "https://facebook.com" },
    { icon: <FaInstagram />, link: "https://instagram.com" },
    { icon: <FaGithub />, link: "https://github.com" },
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        {/* LOGO + SLOGAN */}
        <div style={styles.brand}>
          <h2 style={styles.logo}>E-Shop</h2>
          <p style={styles.tagline}>
            Trải nghiệm mua sắm cao cấp & tinh tế
          </p>
        </div>

        {/* SOCIAL */}
        <div style={styles.socials}>
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIcon}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#111827";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#111827";
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* COPYRIGHT */}
        <div style={styles.copy}>
          © {year} E-Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  footer: {
    marginTop: 80,
    padding: "50px 20px 35px",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(14px)",
    borderTop: "1px solid #e5e7eb",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    textAlign: "center",
  },
  brand: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 1,
    color: "#111827",
    margin: 0,
  },
  tagline: {
    color: "#6b7280",
    marginTop: 6,
    fontSize: 14,
  },
  socials: {
    display: "flex",
    justifyContent: "center",
    gap: 14,
    marginTop: 20,
  },
  socialIcon: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111827",
    transition: "all 0.3s ease",
    textDecoration: "none",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },
  copy: {
    marginTop: 30,
    fontSize: 13,
    color: "#9ca3af",
  },
};
