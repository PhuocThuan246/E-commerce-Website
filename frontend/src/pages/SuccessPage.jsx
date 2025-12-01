import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function SuccessPage() {
  // Khi vào trang này, bắn event để Header reload lại số lượng giỏ hàng
  useEffect(() => {
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        background: "#f9fafb",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px 60px",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          textAlign: "center",
          maxWidth: 500,
          width: "100%",
        }}
      >
        {/* Icon check */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#dcfce7",
            margin: "0 auto 20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 42, color: "#16a34a" }}>✔</span>
        </div>

        <h1 style={{ color: "#111827", fontSize: 26, marginBottom: 10 }}>
          Cảm ơn bạn đã mua hàng!
        </h1>

        <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: 30 }}>
          Đơn hàng của bạn đã được ghi nhận thành công.
          <br />
          Chúng tôi sẽ sớm liên hệ để xác nhận và giao hàng trong thời gian sớm
          nhất.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              background: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseOut={(e) => (e.target.style.background = "#2563eb")}
          >
            ← Quay lại trang chủ
          </Link>

          <Link
            to="/account/orders"
            style={{
              textDecoration: "none",
              background: "white",
              border: "1px solid #d1d5db",
              color: "#111827",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 500,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#f3f4f6")}
            onMouseOut={(e) => (e.target.style.background = "white")}
          >
            Xem đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
