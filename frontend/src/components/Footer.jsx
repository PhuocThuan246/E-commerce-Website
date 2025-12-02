import React from "react";
import { FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";
import "../styles/footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { icon: <FaFacebookF />, link: "https://facebook.com" },
    { icon: <FaInstagram />, link: "https://instagram.com" },
    { icon: <FaGithub />, link: "https://github.com" },
  ];

  return (
    <footer className="footer">
      {/* ==== PHẦN TRÊN (THÔNG TIN GIỐNG GEARVN) ==== */}
      <div className="footer-container">
        <div className="footer-column">
          <h4>VỀ E-SHOP</h4>
          <ul>
            <li>Giới thiệu</li>
            <li>Tuyển dụng</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>CHÍNH SÁCH</h4>
          <ul>
            <li>Chính sách bảo hành</li>
            <li>Chính sách giao hàng</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>THÔNG TIN</h4>
          <ul>
            <li>Hệ thống cửa hàng</li>
            <li>Hướng dẫn mua hàng</li>
            <li>Hướng dẫn thanh toán</li>
            <li>Hướng dẫn trả góp</li>
            <li>Tra cứu địa chỉ bảo hành</li>
            <li>Build PC</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>TỔNG ĐÀI HỖ TRỢ (8:00 - 21:00)</h4>
          <ul>
            <li>Mua hàng: <a href="tel:19005301">1900.5301</a></li>
            <li>Bảo hành: <a href="tel:19005325">1900.5325</a></li>
            <li>Khiếu nại: <a href="tel:18006173">1800.6173</a></li>
            <li>Email: <a href="mailto:cskh@eshop.com">cskh@eshop.com</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>ĐƠN VỊ VẬN CHUYỂN</h4>
          <div className="footer-logos">
            <img src="/banners/ghn.png" alt="GHN" />
            <img src="/banners/ems.png" alt="EMS" />
            <img src="/banners/GHTK.png" alt="GVN" />
          </div>

          
        </div>
      </div>

      {/* ==== PHẦN DƯỚI (LOGO + SOCIAL + COPYRIGHT) ==== */}
      <div className="footer-bottom">
        <div className="footer-brand">
          <h2 className="footer-logo">E-Shop</h2>
          <p className="footer-tagline">Trải nghiệm mua sắm cao cấp & tinh tế</p>
        </div>

        <div className="footer-socials">
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
            >
              {s.icon}
            </a>
          ))}
        </div>

        <div className="footer-copy">
          © {year} E-Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
