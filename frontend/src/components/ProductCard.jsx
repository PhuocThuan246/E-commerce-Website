import React from "react";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../services/api";


export default function ProductCard({ product }) {
  // Lấy giá rẻ nhất trong danh sách biến thể
  let priceDisplay = "Liên hệ";

  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map((v) => v.price || 0);
    const minPrice = Math.min(...prices);
    priceDisplay = `${minPrice.toLocaleString()} ₫`;
  } else if (product.price) {
    // Trường hợp có thuộc tính price riêng
    priceDisplay = `${Number(product.price).toLocaleString()} ₫`;
  }

  return (
    <Link
      to={`/product/${product._id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
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
          src={product.image ? `${SERVER_URL}${product.image}` : "/no-image.png"}
          alt={product.name}
          width="200"
          height="200"
          style={{ borderRadius: 8, objectFit: "cover" }}
        />
        <h3 style={{ margin: "10px 0 4px" }}>{product.name}</h3>
        <p style={{ margin: 0, color: "#6b7280" }}>
          {product.category?.name || "Không rõ danh mục"}
        </p>

        <p style={{ marginTop: 8, fontWeight: 700, color: "#16a34a" }}>
          {priceDisplay}
        </p>
      </div>
    </Link>
  );
}
