import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import orderService from "../services/orderService";
import { toast } from "react-toastify";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn tất",
};

const STATUS_STYLES = {
  pending: { bg: "#FEF3C7", color: "#B45309" },
  confirmed: { bg: "#DBEAFE", color: "#1D4ED8" },
  shipping: { bg: "#E0F2FE", color: "#0369A1" },
  delivered: { bg: "#DCFCE7", color: "#166534" },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
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
        const { data } = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        toast.error("Không thể tải chi tiết đơn hàng!");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 60 }}>Đang tải...</p>;

  if (!isLoggedIn)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2 style={{ color: "#dc2626" }}>🔒 Bạn chưa đăng nhập!</h2>
      </div>
    );

  if (!order)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2>Không tìm thấy đơn hàng!</h2>
        <Link to="/account/orders">← Quay lại</Link>
      </div>
    );

  const st = STATUS_STYLES[order.status];

  return (
    <div style={{ padding: 30, maxWidth: 950, margin: "0 auto" }}>
      <Link
        to="/account/orders"
        style={{
          color: "#dc2626",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← Quay lại danh sách đơn
      </Link>

      {/* Header đơn hàng */}
      <div
        style={{
          marginTop: 18,
          background: "white",
          padding: 24,
          borderRadius: 20,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>
              Đơn #{order._id.slice(-6).toUpperCase()}
            </h2>
            <p style={{ margin: "6px 0", color: "#6b7280" }}>
              Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          <span
            style={{
              color: st.color,
              fontWeight: 700,
              fontSize: 16,
            }}
          >

            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <h3 style={{ marginTop: 16, fontSize: 20 }}>
          Tổng thanh toán:{" "}
          <span style={{ color: "#dc2626", fontWeight: 800 }}>
            {order.total.toLocaleString()} ₫
          </span>
        </h3>
      </div>

      {/* Sản phẩm */}
      <div
        style={{
          marginTop: 26,
          background: "white",
          padding: 24,
          borderRadius: 20,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 14 }}>🛍️ Sản phẩm</h3>

        {order.items.map((i, idx) => (
          <div
            key={idx}
            style={{
              borderBottom:
                idx === order.items.length - 1
                  ? "none"
                  : "1px solid #f3f4f6",
              padding: "12px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <b>{i.product?.name}</b>
              {i.variantName && (
                <p style={{ margin: 0, color: "#6b7280" }}>
                  Biến thể: {i.variantName}
                </p>
              )}
              <span style={{ color: "#4b5563" }}>SL: {i.quantity}</span>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#6b7280" }}>
                Đơn giá: {i.price.toLocaleString()} ₫
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontWeight: 700,
                  color: "#dc2626",
                }}
              >
                {(i.price * i.quantity).toLocaleString()} ₫
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Địa chỉ */}
      <div
        style={{
          marginTop: 26,
          background: "white",
          padding: 24,
          borderRadius: 20,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>📍 Thông tin giao hàng</h3>
        <p>
          <b>{order.customer.name}</b> — {order.customer.phone}
        </p>
        <p>{order.customer.address}</p>
        {order.customer.email && <p>{order.customer.email}</p>}
      </div>

      {/* Lịch sử trạng thái */}
      <div
        style={{
          marginTop: 26,
          background: "white",
          padding: 24,
          borderRadius: 20,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h3>⏱️ Lịch sử trạng thái</h3>

        <table
          style={{
            width: "100%",
            marginTop: 16,
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: 12, textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: 12, textAlign: "left" }}>Thời gian</th>
            </tr>
          </thead>

          <tbody>
            {order.statusHistory.map((h, idx) => {
              const st2 = STATUS_STYLES[h.status];
              return (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 10 }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: st2.bg,
                        color: st2.color,
                        fontWeight: 600,
                      }}
                    >
                      {STATUS_LABELS[h.status]}
                    </span>
                  </td>

                  <td style={{ padding: 10 }}>
                    {new Date(h.updatedAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
