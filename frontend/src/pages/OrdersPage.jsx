import React, { useEffect, useState } from "react";
import orderService from "../services/orderService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn tất",
};

const STATUS_STYLES = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  confirmed: { bg: "#DBEAFE", color: "#1E40AF" },
  shipping: { bg: "#E0F2FE", color: "#075985" },
  delivered: { bg: "#DCFCE7", color: "#166534" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const { data } = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        if (err.response?.status === 401) setIsLoggedIn(false);
        else toast.error("Không thể tải đơn hàng!");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ===== Loading ===== */
  if (loading)
    return <p style={{ textAlign: "center", marginTop: 60 }}>Đang tải...</p>;

  /* ===== Not logged in ===== */
  if (!isLoggedIn)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2 style={{ color: "#dc2626" }}>🔒 Bạn cần đăng nhập!</h2>
        <p style={{ color: "#6b7280" }}>Vui lòng đăng nhập để xem đơn hàng.</p>
      </div>
    );

  /* ===== Empty order ===== */
  if (orders.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2 style={{ color: "#111827" }}>📭 Chưa có đơn hàng nào</h2>
        <p style={{ color: "#6b7280" }}>
          Hãy bắt đầu mua sắm cùng{" "}
          <strong style={{ color: "#dc2626" }}>E-Shop</strong>!
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: 20,
            background: "#dc2626",
            color: "white",
            padding: "12px 20px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 600,
            boxShadow: "0 5px 18px rgba(0,0,0,0.15)",
            transition: "0.2s",
          }}
        >
          ← Tiếp tục mua sắm
        </Link>
      </div>
    );

  /* ===== Main UI ===== */
  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: 40,
          fontSize: 30,
          color: "#dc2626",
          fontWeight: 800,
        }}
      >
        Lịch sử đơn hàng
      </h1>

      {orders.map((order) => {
        const st = STATUS_STYLES[order.status];
        return (
          <div
            key={order._id}
            style={{
              background: "white",
              borderRadius: 18,
              padding: 22,
              marginBottom: 28,
              boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
              border: "1px solid #f3f4f6",
              transition: "0.25s",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #f3f4f6",
                paddingBottom: 14,
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#111827",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  Đơn hàng #{order._id.slice(-6).toUpperCase()}
                </h3>
                <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
                  📅 {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: st.bg,
                  color: st.color,
                  fontWeight: 600,
                  height: "fit-content",
                }}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            {/* Item list */}
            {order.items.map((i, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom:
                    idx === order.items.length - 1
                      ? "none"
                      : "1px solid #f3f4f6",
                }}
              >
                <div>
                  <b style={{ color: "#111827" }}>{i.product?.name}</b>
                  {i.variantName && (
                    <p style={{ margin: "2px 0", color: "#6b7280" }}>
                      {i.variantName}
                    </p>
                  )}
                  <span style={{ color: "#4b5563", fontSize: 14 }}>
                    SL: {i.quantity}
                  </span>
                </div>

                <p
                  style={{
                    fontWeight: 700,
                    color: "#dc2626",
                    minWidth: 110,
                    textAlign: "right",
                  }}
                >
                  {(i.price * i.quantity).toLocaleString()} ₫
                </p>
              </div>
            ))}

            {/* Total */}
            <h3
              style={{
                textAlign: "right",
                marginTop: 20,
                color: "#111827",
                fontSize: 18,
              }}
            >
              Tổng:{" "}
              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                {order.total.toLocaleString()} ₫
              </span>
            </h3>

            {/* Xem chi tiết */}
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <Link
                to={`/account/orders/${order._id}`}
                style={{
                  color: "#dc2626",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                Xem chi tiết →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
