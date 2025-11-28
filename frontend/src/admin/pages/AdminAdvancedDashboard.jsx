import React, { useEffect, useState } from "react";
import adminDashboardService from "../services/adminDashboardService";
import { Bar } from "react-chartjs-2";

export default function AdvancedDashboard() {
  const [type, setType] = useState("year");
  const [stats, setStats] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const loadData = () => {
    adminDashboardService
      .getAdvanced({ type, start, end })
      .then(res => setStats(res.data));
  };

  useEffect(() => {
    if (type !== "range") loadData();
  }, [type]);

  // ================= LABEL THEO THỜI GIAN =================
  const labels = stats.map(s => {
    if (type === "month") return `${s._id.month}/${s._id.year}`;
    if (type === "week") return `Tuần ${s._id.week} - ${s._id.year}`;
    if (type === "quarter") return `Quý ${s._id.quarter}/${s._id.year}`;
    if (type === "range") return s._id?.date || "...";
    return s._id.year;
  });

  // ================= DATA =================
  const revenueData  = stats.map(s => s.totalRevenue);
  const profitData   = stats.map(s => s.profit);
  const ordersData   = stats.map(s => s.totalOrders);
  const productsData = stats.map(s => s.totalProducts);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, marginBottom: 10 }}>📈 Phân tích nâng cao</h2>

      {/* ================= FILTER ================= */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="year">Theo năm</option>
          <option value="quarter">Theo quý</option>
          <option value="month">Theo tháng</option>
          <option value="week">Theo tuần</option>
          <option value="range">Khoảng thời gian</option>
        </select>

        {type === "range" && (
          <>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} />
            <span>→</span>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
            <button
              onClick={loadData}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Xem
            </button>
          </>
        )}
      </div>

      {/* ================= BIỂU ĐỒ DOANH THU & LỢI NHUẬN ================= */}
      <h3>💰 Doanh thu & Lợi nhuận</h3>
      <Bar
        options={{
          responsive: true,
          plugins: { legend: { position: "top" } }
        }}
        data={{
          labels,
          datasets: [
            {
              label: "Doanh thu",
              data: revenueData,
              backgroundColor: "#2563eb"
            },
            {
              label: "Lợi nhuận (30%)",
              data: profitData,
              backgroundColor: "#16a34a"
            }
          ]
        }}
      />

      {/* ================= BIỂU ĐỒ SỐ LƯỢNG ================= */}
      <h3 style={{ marginTop: 40 }}>📦 Đơn hàng & Sản phẩm bán</h3>
      <Bar
        options={{
          responsive: true,
          plugins: { legend: { position: "top" } }
        }}
        data={{
          labels,
          datasets: [
            {
              label: "Số đơn hàng",
              data: ordersData,
              backgroundColor: "#f59e0b"
            },
            {
              label: "Số sản phẩm bán",
              data: productsData,
              backgroundColor: "#7c3aed"
            }
          ]
        }}
      />

      {/* ================= GHI CHÚ ================= */}
      <p style={{
        fontSize: 13,
        color: "#6b7280",
        marginTop: 15,
        lineHeight: 1.6
      }}>
        📌 Doanh thu chỉ tính từ các đơn hàng đã giao thành công (trạng thái <b>delivered</b>).<br />
        📌 Lợi nhuận = <b>30% doanh thu</b> (ước tính cho mục đích thống kê).<br />
        📌 Số sản phẩm bán = tổng số lượng sản phẩm trong các đơn hàng.<br />
        📌 Biểu đồ giúp admin so sánh xu hướng giữa các mốc thời gian khác nhau.
      </p>

      {/* ================= BẢNG DỮ LIỆU ================= */}
      <h3 style={{ marginTop: 35 }}>📋 Bảng chi tiết</h3>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #e5e7eb"
      }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={thStyle}>Thời gian</th>
            <th style={thStyle}>Đơn hàng</th>
            <th style={thStyle}>Doanh thu</th>
            <th style={thStyle}>Lợi nhuận</th>
            <th style={thStyle}>Sản phẩm bán</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={tdCenter}>{labels[i]}</td>
              <td style={tdCenter}>{s.totalOrders}</td>
              <td style={tdRight}>{formatMoney(s.totalRevenue)}</td>
              <td style={tdRight}>{formatMoney(s.profit)}</td>
              <td style={tdCenter}>{s.totalProducts}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
const thStyle = {
  padding: "10px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600
};

const tdCenter = {
  padding: "10px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb"
};

const tdRight = {
  padding: "10px",
  textAlign: "right",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 500
};

function formatMoney(v) {
  return Number(v || 0).toLocaleString("vi-VN") + " ₫";
}
