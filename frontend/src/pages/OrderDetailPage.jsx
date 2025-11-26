import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import orderService from "../services/orderService";
import { toast } from "react-toastify";

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

    async function fetchDetail() {
      try {
        const { data } = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setIsLoggedIn(false);
        } else {
          toast.error("Lỗi khi tải chi tiết đơn hàng!");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Đang tải...</p>;

  if (!isLoggedIn)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2 style={{ color: "#dc2626" }}>🔒 Vui lòng đăng nhập để xem đơn hàng!</h2>
        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Bạn cần đăng nhập để xem chi tiết đơn hàng của mình.
        </p>
      </div>
    );

  if (!order)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2 style={{ color: "#111827" }}>Không tìm thấy đơn hàng</h2>
        <Link to="/account/orders">← Quay lại danh sách đơn</Link>
      </div>
    );

  const statusColor = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipping: "#6366f1",
    delivered: "#16a34a",
  }[order.status] || "#6b7280";

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Link to="/account/orders" style={{ textDecoration: "none", color: "#2563eb" }}>
          ← Quay lại danh sách đơn
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#111827" }}>
              Đơn hàng #{order._id.slice(-6).toUpperCase()}
            </h2>
            <p style={{ margin: "6px 0", color: "#6b7280" }}>
              Ngày đặt:{" "}
              {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: statusColor + "22",
              color: statusColor,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {order.status}
          </div>
        </div>

        {/* Tổng & Loyalty */}
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <p style={{ margin: 0, color: "#4b5563" }}>
            Tạm tính: {order.subtotal.toLocaleString()} ₫
          </p>
          <p style={{ margin: 0, color: "#4b5563" }}>
            Phí ship: {order.shippingFee.toLocaleString()} ₫
          </p>
          {order.tax > 0 && (
            <p style={{ margin: 0, color: "#4b5563" }}>
              Thuế: {order.tax.toLocaleString()} ₫
            </p>
          )}
          {order.discountAmount > 0 && (
            <p style={{ margin: 0, color: "#b91c1c" }}>
              Giảm giá mã: -{order.discountAmount.toLocaleString()} ₫
            </p>
          )}
          {order.loyaltyDiscountAmount > 0 && (
            <p style={{ margin: 0, color: "#b91c1c" }}>
              Giảm bằng điểm: -{order.loyaltyDiscountAmount.toLocaleString()} ₫ (
              {order.loyaltyPointsUsed} điểm)
            </p>
          )}

          <h3 style={{ marginTop: 8 }}>
            Tổng thanh toán:{" "}
            <span style={{ color: "#dc2626" }}>
              {order.total.toLocaleString()} ₫
            </span>
          </h3>

          {order.loyaltyPointsEarned > 0 && (
            <p style={{ margin: 0, color: "#16a34a" }}>
              🎁 Điểm tích lũy từ đơn này:{" "}
              <strong>{order.loyaltyPointsEarned} điểm</strong>
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          marginBottom: 24,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Sản phẩm</h3>
        {order.items.map((i, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                idx === order.items.length - 1
                  ? "none"
                  : "1px solid #f3f4f6",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>
                {i.product?.name || "Sản phẩm"}
              </div>
              {i.variantName && (
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  Biến thể: {i.variantName}
                </div>
              )}
              <div style={{ color: "#4b5563", fontSize: 14 }}>
                Số lượng: {i.quantity}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                Đơn giá: {i.price.toLocaleString()} ₫
              </div>
              <div style={{ fontWeight: 600, color: "#b91c1c" }}>
                {(i.price * i.quantity).toLocaleString()} ₫
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping info */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          marginBottom: 24,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>
          Thông tin nhận hàng
        </h3>
        <p style={{ margin: 0 }}>
          👤 <strong>{order.customer.name}</strong> — {order.customer.phone}
        </p>
        <p style={{ margin: "4px 0" }}>📍 {order.customer.address}</p>
        {order.customer.email && (
          <p style={{ margin: 0 }}>✉️ {order.customer.email}</p>
        )}
      </div>

      {/* Status history */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Lịch sử trạng thái</h3>
        {order.statusHistory && order.statusHistory.length > 0 ? (
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ textAlign: "left", padding: 8 }}>Trạng thái</th>
                <th style={{ textAlign: "left", padding: 8 }}>Thời gian cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {order.statusHistory.map((h, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 8, textTransform: "capitalize" }}>
                    {h.status}
                  </td>
                  <td style={{ padding: 8 }}>
                    {new Date(h.updatedAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#6b7280" }}>Chưa có lịch sử trạng thái.</p>
        )}
      </div>
    </div>
  );
}
