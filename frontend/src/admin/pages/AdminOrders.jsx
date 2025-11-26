import React, { useEffect, useState } from "react";
import adminOrderService from "../services/adminOrderService";

const STATUS_OPTIONS = ["pending", "confirmed", "shipping", "delivered"];

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "today", label: "Hôm nay" },
  { key: "yesterday", label: "Hôm qua" },
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
  { key: "range", label: "Khoảng ngày" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // ============================
  // Load danh sách đơn
  // ============================
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, startDate, endDate]);

  async function fetchOrders() {
    try {
      setLoading(true);

      const params = { page, limit: 20 };

      if (filter !== "all" && filter !== "range") {
        params.filter = filter;
      }
      if (filter === "range" && startDate && endDate) {
        params.filter = "range";
        params.start = startDate;
        params.end = endDate;
      }

      const { data } = await adminOrderService.getAll(params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // Xem chi tiết đơn
  // ============================
  async function handleViewDetail(orderId) {
    try {
      const { data } = await adminOrderService.getById(orderId);
      setSelectedOrder(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải chi tiết đơn hàng!");
    }
  }

  // ============================
  // Đổi trạng thái đơn
  // ============================
  async function handleChangeStatus(newStatus) {
    if (!selectedOrder) return;

    if (!window.confirm("Xác nhận đổi trạng thái đơn hàng?")) return;

    try {
      setStatusUpdating(true);
      const { data } = await adminOrderService.updateStatus(
        selectedOrder._id,
        newStatus
      );

      // cập nhật chi tiết
      setSelectedOrder(data);

      // cập nhật list
      setOrders((prev) =>
        prev.map((o) => (o._id === data._id ? { ...o, status: data.status } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái đơn!");
    } finally {
      setStatusUpdating(false);
    }
  }

  function formatMoney(v) {
    if (v == null) return "0 ₫";
    return `${Number(v).toLocaleString("vi-VN")} ₫`;
  }

  const isRange = filter === "range";

  if (loading && orders.length === 0)
    return <p style={{ textAlign: "center" }}>Đang tải...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16, color: "#111827" }}>📦 Quản lý đơn hàng</h2>

      {/* Bộ lọc */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600 }}>Lọc theo thời gian:</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              backgroundColor: filter === f.key ? "#111827" : "#fff",
              color: filter === f.key ? "#fff" : "#111827",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}

        {isRange && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              style={dateInput}
            />
            <span>→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              style={dateInput}
            />
          </>
        )}
      </div>

      {/* Bảng đơn hàng */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <div>
          {orders.length === 0 ? (
            <p>Không có đơn hàng nào.</p>
          ) : (
            <>
              <table style={table}>
                <thead style={{ background: "#f3f4f6" }}>
                  <tr>
                    <th style={th}>Mã đơn</th>
                    <th style={th}>Khách hàng</th>
                    <th style={th}>Tổng tiền</th>
                    <th style={th}>Trạng thái</th>
                    <th style={th}>Ngày đặt</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td style={td}>#{o._id.slice(-6).toUpperCase()}</td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>
                          {o.customer?.name || "Khách vãng lai"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {o.customer?.email}
                          <br />
                          {o.customer?.phone}
                        </div>
                      </td>
                      <td style={{ ...td, color: "#dc2626", fontWeight: 600 }}>
                        {formatMoney(o.total)}
                      </td>
                      <td style={td}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            background: "#e5e7eb",
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td style={td}>
                        {new Date(o.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => handleViewDetail(o._id)}
                          style={detailBtn}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  style={pageBtn}
                >
                  ◀
                </button>
                <span style={{ fontSize: 13 }}>
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => (p < totalPages ? p + 1 : p))
                  }
                  disabled={page >= totalPages}
                  style={pageBtn}
                >
                  ▶
                </button>
              </div>
            </>
          )}
        </div>

        {/* Panel chi tiết đơn */}
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            padding: 16,
            minHeight: 200,
          }}
        >
          <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
            Chi tiết đơn hàng
          </h3>

          {!selectedOrder ? (
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Chọn một đơn hàng ở bảng bên trái để xem chi tiết.
            </p>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Mã đơn: #{selectedOrder._id.slice(-6).toUpperCase()}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Ngày đặt:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>

              <section style={sectionBox}>
                <h4 style={sectionTitle}>Khách hàng</h4>
                <p>
                  <b>{selectedOrder.customer?.name || "Khách vãng lai"}</b>
                  <br />
                  {selectedOrder.customer?.email}
                  <br />
                  {selectedOrder.customer?.phone}
                  <br />
                  {selectedOrder.customer?.address}
                </p>
              </section>

              <section style={sectionBox}>
                <h4 style={sectionTitle}>Sản phẩm</h4>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {selectedOrder.items.map((it) => (
                    <li key={it._id} style={{ fontSize: 13, marginBottom: 4 }}>
                      {it.product?.name || "Sản phẩm"}{" "}
                      {it.variantName ? `(${it.variantName})` : ""} x
                      {it.quantity} — {formatMoney(it.price)}
                    </li>
                  ))}
                </ul>
              </section>

              <section style={sectionBox}>
                <h4 style={sectionTitle}>Thanh toán</h4>
                <p style={{ fontSize: 13 }}>
                  Tạm tính: {formatMoney(selectedOrder.subtotal)}
                  <br />
                  Thuế: {formatMoney(selectedOrder.tax)}
                  <br />
                  Phí ship: {formatMoney(selectedOrder.shippingFee)}
                  <br />
                  Giảm giá mã khuyến mãi:{" "}
                    {formatMoney(selectedOrder.discountAmount)}
                  {selectedOrder.discountCode && (
                    <>
                      {" "}
                      (code: <b>{selectedOrder.discountCode.code}</b>)
                    </>
                  )}
                  <br />
                  <b>Tổng thanh toán: {formatMoney(selectedOrder.total)}</b>
                </p>
              </section>

              <section style={sectionBox}>
                <h4 style={sectionTitle}>Trạng thái đơn hàng</h4>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleChangeStatus(e.target.value)}
                    disabled={statusUpdating}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 13,
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {statusUpdating && (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Đang cập nhật...
                    </span>
                  )}
                </div>

                <h5
                  style={{
                    marginTop: 10,
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Lịch sử trạng thái
                </h5>
                {selectedOrder.statusHistory?.length ? (
                  <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12 }}>
                    {selectedOrder.statusHistory.map((h) => (
                      <li key={h._id}>
                        <b>{h.status}</b> —{" "}
                        {new Date(h.updatedAt).toLocaleString("vi-VN")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 12, color: "#6b7280" }}>
                    Chưa có lịch sử trạng thái.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const th = {
  padding: 10,
  border: "1px solid #e5e7eb",
  fontWeight: 600,
  fontSize: 13,
  textAlign: "left",
};

const td = {
  padding: 10,
  border: "1px solid #e5e7eb",
  verticalAlign: "top",
  fontSize: 13,
};

const dateInput = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 13,
};

const detailBtn = {
  padding: "6px 10px",
  fontSize: 12,
  borderRadius: 999,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};

const pageBtn = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
};

const sectionBox = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: 8,
  marginTop: 8,
};

const sectionTitle = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
};
