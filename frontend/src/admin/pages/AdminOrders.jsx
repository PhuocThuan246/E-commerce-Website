import React, { useEffect, useState } from "react";
import adminOrderService from "../services/adminOrderService";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data } = await adminOrderService.getAll();
        setOrders(data);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Đang tải...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20, color: "#111827" }}>
        📦 Danh sách đơn hàng ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={th}>Mã đơn</th>
              <th style={th}>Tên khách</th>
              <th style={th}>Email / Số điện thoại</th>
              <th style={th}>Sản phẩm đặt</th>
              <th style={th}>Tổng tiền</th>
              <th style={th}>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td style={td}>#{o._id.slice(-6).toUpperCase()}</td>
                <td style={td}>{o.customer?.name || "Khách vãng lai"}</td>
                <td style={td}>
                  {o.customer?.email || "—"}
                  <br />
                  {o.customer?.phone || ""}
                </td>
                <td style={td}>
                  {o.items
                    .map(
                      (i) =>
                        `${i.product?.name || "Sản phẩm"}${
                          i.variantName ? ` (${i.variantName})` : ""
                        } x${i.quantity}`
                    )
                    .join(", ")}
                </td>
                <td style={{ ...td, color: "#dc2626", fontWeight: 600 }}>
                  {o.total?.toLocaleString()} ₫
                </td>
                <td style={td}>
                  {new Date(o.createdAt).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  padding: 10,
  border: "1px solid #e5e7eb",
  fontWeight: 600,
  textAlign: "left",
};

const td = {
  padding: 10,
  border: "1px solid #e5e7eb",
  verticalAlign: "top",
  fontSize: 14,
};
