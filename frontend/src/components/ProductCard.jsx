import React from "react";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../services/api";

export default function ProductCard({ product }) {
  // 🧮 Xử lý hiển thị giá tiền
  let priceDisplay = "Liên hệ";

  if (product.variants && product.variants.length > 0) {
    const prices = product.variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      priceDisplay = `${minPrice.toLocaleString("vi-VN")} ₫`;
    }
  } else if (
    product.effectivePrice !== undefined &&
    !isNaN(Number(product.effectivePrice))
  ) {
    const price = Number(product.effectivePrice);
    priceDisplay = price > 0 ? `${price.toLocaleString("vi-VN")} ₫` : "Liên hệ";
  } else if (
    product.price !== undefined &&
    product.price !== null &&
    !isNaN(Number(product.price))
  ) {
    const price = Number(product.price);
    priceDisplay = price > 0 ? `${price.toLocaleString("vi-VN")} ₫` : "Liên hệ";
  }

  // 🏷️ Tên danh mục
  const categoryName =
    (typeof product.category === "object" && product.category?.name) ||
    product.categoryName ||
    product.category ||
    "Không rõ danh mục";

  // ⭐ Rating trung bình (hiển thị tối đa 5 sao)
  const rating = Number(product.ratingAverage || 0);
  const filledStars = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, i) => i < filledStars);

  return (
    <Link
      to={`/product/${product._id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
          width: 220,
          margin: 10,
          textAlign: "center",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        }}
      >
        <img
          src={
            product.images && product.images.length > 0
              ? (
                  product.images[0].startsWith("http")
                    ? product.images[0]
                    : `${SERVER_URL}${product.images[0]}`
                )
              : "/no-image.png"
          }
          alt={product.name}
          width="200"
          height="200"
          style={{ borderRadius: 8, objectFit: "cover" }}
          onError={(e) => {
            if (e.target.src !== "/no-image.png") {
              e.target.src = "/no-image.png";  // chỉ fallback 1 lần → KHÔNG giật nữa
            }
          }}
        />


        <h3
          style={{
            margin: "10px 0 4px",
            fontWeight: 600,
            fontSize: 15,
            color: "#111827",
          }}
        >
          {product.name}
        </h3>

        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          {categoryName}
        </p>

        {/* ⭐ Hiển thị số sao trung bình */}
        <div
          style={{
            marginTop: 4,
            marginBottom: 4,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {stars.map((filled, i) => (
            <span
              key={i}
              style={{
                color: filled ? "#facc15" : "#e5e7eb",
                fontSize: 15,
              }}
            >
              ★
            </span>
          ))}
          <span
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginLeft: 4,
            }}
          >
            ({rating.toFixed(1)})
          </span>
        </div>

        {/* ✅ Giá hiển thị an toàn */}
        <p
          style={{
            marginTop: 8,
            fontWeight: 700,
            color: "#16a34a",
            fontSize: 15,
          }}
        >
          {priceDisplay}
        </p>
      </div>
    </Link>
  );
}
