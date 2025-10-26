import React, { useEffect, useState } from "react";
import orderService from "../services/orderService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data } = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Đang tải...</p>;

  if (orders.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2 style={{ color: "#111827" }}>📭 Bạn chưa có đơn hàng nào</h2>
        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Hãy bắt đầu mua sắm và trải nghiệm cùng{" "}
          <strong style={{ color: "#2563eb" }}>E-Shop</strong>!
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: 20,
            background: "#2563eb",
            color: "white",
            padding: "10px 18px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            transition: "0.2s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#1e40af")}
          onMouseOut={(e) => (e.target.style.background = "#2563eb")}
        >
          ← Quay lại mua sắm
        </Link>
      </div>
    );

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: 950,
        margin: "0 auto",
        background: "#f9fafb",
        borderRadius: 12,
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: 40,
          fontSize: 28,
          color: "#111827",
        }}
      >
        📦 Đơn hàng của bạn
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            background: "white",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
            transition: "0.25s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.12)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* --- Header đơn hàng --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: 10,
              marginBottom: 15,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontWeight: 600,
                color: "#2563eb",
              }}
            >
              🧾 Mã đơn: {order._id.slice(-6).toUpperCase()}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
              Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          {/* --- Danh sách sản phẩm --- */}
          {order.items.map((i, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom:
                  idx === order.items.length - 1
                    ? "none"
                    : "1px solid #f3f4f6",
              }}
            >
                <div>
                <strong style={{ color: "#111827", display: "block", marginBottom: 2 }}>
                    {i.product?.name || "Sản phẩm"}
                </strong>
                {i.variantName && (
                    <p
                    style={{
                        color: "#6b7280",
                        margin: "2px 0 4px",
                        fontSize: 14,
                    }}
                    >
                    Biến thể: {i.variantName}
                    </p>
                )}
                <small
                    style={{
                    color: "#4b5563",
                    fontSize: 14,
                    display: "block",
                    marginTop: 2,
                    }}
                >
                    Số lượng: {i.quantity}
                </small>
                </div>


              <p
                style={{
                  fontWeight: 600,
                  color: "#dc2626",
                  fontSize: 15,
                  minWidth: 100,
                  textAlign: "right",
                }}
              >
                {(i.price * i.quantity).toLocaleString()} ₫
              </p>
            </div>

          ))}

          {/* --- Tổng cộng --- */}
          <h3
            style={{
              textAlign: "right",
              marginTop: 20,
              color: "#111827",
              fontSize: 18,
            }}
          >
            Tổng cộng:{" "}
            <span style={{ color: "#dc2626", fontWeight: 700 }}>
              {order.total.toLocaleString()} ₫
            </span>
          </h3>

          {/* --- Thông tin người nhận --- */}
          <div
            style={{
              marginTop: 15,
              background: "#f9fafb",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 14,
              color: "#4b5563",
            }}
          >
            <p style={{ margin: 0 }}>
              👤 <strong>{order.customer.name}</strong> — {order.customer.phone}
            </p>
            <p style={{ margin: "4px 0 0" }}>
              📍 {order.customer.address}
              {order.customer.email && (
                <>
                  <br />✉️ {order.customer.email}
                </>
              )}
            </p>
          </div>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 30 }}>
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
          ← Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
