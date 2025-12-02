import React, { useEffect, useState } from "react";
import adminOrderService from "../services/adminOrderService";
import ConfirmModal from "../components/ConfirmModal";

/* ===================== CONSTANTS ====================== */

const STATUS_OPTIONS = ["pending", "confirmed", "shipping", "delivered"];


const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao hàng",
  delivered: "Đã giao thành công",
};

const STATUS_STYLES = {
  pending: { background: "#fff7e6", color: "#b46905" },
  confirmed: { background: "#e8f0ff", color: "#1d4ed8" },
  shipping: { background: "#e0faff", color: "#0369a1" },
  delivered: { background: "#e6ffee", color: "#166534" },
};

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "today", label: "Hôm nay" },
  { key: "yesterday", label: "Hôm qua" },
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
  { key: "range", label: "Khoảng ngày" },
];

/* ================================================= */

export default function AdminOrders() {
  /* ===== STATE ===== */
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  /* ===== LOAD ORDERS ===== */
  useEffect(() => {
    fetchOrders();
  }, [page, filter, startDate, endDate]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = { page, limit: 20 };

      if (filter !== "all" && filter !== "range") params.filter = filter;
      if (filter === "range" && startDate && endDate) {
        params.filter = "range";
        params.start = startDate;
        params.end = endDate;
      }

      const { data } = await adminOrderService.getAll(params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      alert("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  /* ===== VIEW DETAIL ===== */
  async function handleViewDetail(orderId) {
    try {
      const { data } = await adminOrderService.getById(orderId);
      setSelectedOrder(data);
    } catch {
      alert("Không thể tải chi tiết đơn!");
    }
  }

  /* ===== OPEN CONFIRM POPUP ===== */
  function handleChangeStatus(newStatus) {
    if (!selectedOrder) return;
    setPendingStatus(newStatus);
    setShowConfirm(true);
  }

  /* ===== CONFIRMED UPDATE ===== */
  async function doUpdateStatus() {
    try {
      setStatusUpdating(true);

      const { data } = await adminOrderService.updateStatus(
        selectedOrder._id,
        pendingStatus
      );

      setSelectedOrder(data);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data._id ? { ...o, status: data.status } : o
        )
      );
    } catch {
      alert("Không thể cập nhật trạng thái!");
    } finally {
      setStatusUpdating(false);
      setShowConfirm(false);
    }
  }

    /* ===== FORMAT MONEY ===== */
    const formatMoney = (v) =>
      `${Number(v).toLocaleString("vi-VN")} ₫`;

    const isRange = filter === "range";

    if (loading && orders.length === 0)
      return <p style={{ textAlign: "center", marginTop: 40 }}>Đang tải...</p>;
    const filteredOrders = orders.filter((o) => {
    const keyword = search.toLowerCase();

    return (
      o._id.toLowerCase().includes(keyword) ||
      (o.customer?.name || "").toLowerCase().includes(keyword) ||
      (o.customer?.email || "").toLowerCase().includes(keyword) ||
      (o.customer?.phone || "").toLowerCase().includes(keyword)
    );
  });

  /* =========================================================== */
  /* ========================= UI ============================== */
  /* =========================================================== */

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>📦 Quản lý đơn hàng</h2>
      <input
          type="text"
          placeholder="Tìm theo mã đơn, tên khách, email, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            marginBottom: 20,
            fontSize: 15,
          }}
        />

      {/* Confirm Modal */}
      <ConfirmModal
        show={showConfirm}
        message="Bạn có chắc muốn đổi trạng thái đơn hàng?"
        onConfirm={doUpdateStatus}
        onCancel={() => setShowConfirm(false)}
      />

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        <span style={styles.filterLabel}>Lọc theo thời gian:</span>

        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? styles.filterBtnActive : {}),
            }}
          >
            {f.label}
          </button>
        ))}

        {isRange && (
          <div style={styles.dateRow}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={{ margin: "0 4px" }}>→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div style={styles.mainGrid}>
        {/* LEFT TABLE */}
        <div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mã đơn</th>
                <th style={styles.th}>Khách hàng</th>
                <th style={styles.th}>Tổng tiền</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Ngày đặt</th>
                <th style={styles.th}></th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td style={styles.td}>#{o._id.slice(-6).toUpperCase()}</td>

                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>
                      {o.customer?.name || "Khách vãng lai"}
                    </div>
                    <div style={styles.textMuted}>
                      {o.customer?.email}
                      <br />
                      {o.customer?.phone}
                    </div>
                  </td>

                  <td style={{ ...styles.td, color: "#dc2626" }}>
                    <b>{formatMoney(o.total)}</b>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        background: STATUS_STYLES[o.status].background,
                        color: STATUS_STYLES[o.status].color,
                      }}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td style={styles.td}>
                    <button
                      onClick={() => handleViewDetail(o._id)}
                      style={styles.viewBtn}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={styles.pageBtn}
              disabled={page <= 1}
            >
              ◀
            </button>
            <span style={styles.pageInfo}>
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              style={styles.pageBtn}
              disabled={page >= totalPages}
            >
              ▶
            </button>
          </div>
        </div>

        {/* RIGHT DETAIL PANEL */}
        <div style={styles.detailCard}>
          {!selectedOrder ? (
            <p style={styles.textMuted}>
              Chọn một đơn hàng để xem chi tiết.
            </p>
          ) : (
            <>
              {/* HEADER */}
              <div style={styles.detailHeader}>
                <h3 style={styles.detailTitle}>
                  Đơn #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <p style={styles.detailDate}>
                  Ngày đặt:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Customer */}
              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Khách hàng</h4>
                <p style={styles.sectionText}>
                  <b>{selectedOrder.customer?.name}</b>
                  <br />
                  {selectedOrder.customer?.email}
                  <br />
                  {selectedOrder.customer?.phone}
                  <br />
                  {selectedOrder.customer?.address}
                </p>
              </section>

              {/* Products */}
              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Sản phẩm</h4>
                <ul style={styles.productList}>
                  {selectedOrder.items.map((it) => (
                    <li key={it._id}>
                      {it.product?.name}{" "}
                      {it.variantName && (
                        <span style={styles.variant}>
                          ({it.variantName})
                        </span>
                      )}
                      × {it.quantity} —{" "}
                      <b>{formatMoney(it.price)}</b>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Status */}
              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Trạng thái</h4>

                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleChangeStatus(e.target.value)}
                  style={styles.statusSelect}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>

                {statusUpdating && (
                  <span style={styles.textMuted}>Đang cập nhật...</span>
                )}
              </section>

              {/* Status History */}
              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Lịch sử trạng thái</h4>
                <ul style={styles.historyList}>
                  {selectedOrder.statusHistory.map((h) => (
                    <li key={h._id}>
                      <b>{STATUS_LABELS[h.status]}</b> —{" "}
                      {new Date(h.updatedAt).toLocaleString("vi-VN")}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* ========================== STYLES ======================== */
/* ========================================================= */

const styles = {
  container: {
    padding: 28,
    maxWidth: 1500,
    margin: "0 auto",
  },

  pageTitle: {
    marginBottom: 18,
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
  },

  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginBottom: 18,
  },

  filterLabel: {
    fontWeight: 600,
    marginRight: 8,
    color: "#374151",
  },

  filterBtn: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: 13,
  },

  filterBtnActive: {
    background: "#111827",
    color: "#fff",
    borderColor: "#111827",
  },

  dateRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  dateInput: {
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1.1fr",
    gap: 24,
  },

  table: {
    width: "100%",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 3px 10px rgba(0,0,0,0.03)",
  },

  th: {
    padding: 12,
    background: "#f3f4f6",
    fontWeight: 600,
    fontSize: 13,
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
  },

  textMuted: {
    fontSize: 12,
    color: "#6b7280",
  },

  statusTag: {
    padding: "4px 12px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
  },

  viewBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },

  pagination: {
    marginTop: 12,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },

  pageBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },

  pageInfo: {
    fontSize: 13,
  },

  detailCard: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    padding: 20,
    minHeight: 300,
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  },

  detailHeader: {
    marginBottom: 16,
  },

  detailTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },

  detailDate: {
    color: "#6b7280",
    marginTop: 4,
  },

  section: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 14,
    marginTop: 14,
  },

  sectionTitle: {
    fontWeight: 700,
    marginBottom: 6,
    fontSize: 15,
  },

  sectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: "22px",
  },

  productList: {
    paddingLeft: 18,
    fontSize: 14,
  },

  variant: {
    color: "#6b7280",
  },

  historyList: {
    paddingLeft: 18,
    fontSize: 13,
  },

  statusSelect: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    marginBottom: 6,
  },
};
