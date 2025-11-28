import React, { useEffect, useState } from "react";
import adminDashboardService from "../services/adminDashboardService";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function SimpleDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminDashboardService.getSimple().then(res => setData(res.data));
  }, []);

  if (!data) return <p>Đang tải dữ liệu...</p>;

  const labels = data.bestProducts.map(p => p.name);
  const values = data.bestProducts.map(p => p.totalSold);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>📊 Bảng điều khiển cơ bản</h2>
      <p style={{ color: "#6b7280" }}>
        Tổng quan hiệu suất cửa hàng và các chỉ số quan trọng.
      </p>

      {/* ===== KPI CARDS ===== */}
      <div style={styles.cards}>
        <Card title="Tổng người dùng" value={data.totalUsers} color="#2563eb" />
        <Card title="Người dùng mới (7 ngày)" value={data.newUsers} color="#16a34a" />
        <Card title="Đơn hàng" value={data.totalOrders} color="#f59e0b" />
        <Card title="Doanh thu (đơn đã giao)" value={formatMoney(data.revenue)} color="#dc2626" />
      </div>

      {/* ===== BAR CHART ===== */}
      <div style={styles.chartBox}>
        <h3>🔥 Top sản phẩm bán chạy</h3>
        <Bar
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" }
            },
            scales: {
              x: { ticks: { maxRotation: 0, minRotation: 0 } }
            }
          }}
          data={{
            labels,
            datasets: [{
              label: "Số lượng bán",
              data: values,
              backgroundColor: "#3b82f6",
              borderRadius: 6
            }]
          }}
        />
      </div>

      {/* ===== PIE + LIST ===== */}
      <div style={styles.row}>

        <div style={styles.chartBox}>
          <h3>📦 Tỷ lệ bán theo sản phẩm</h3>
          <Pie
            data={{
              labels,
              datasets: [{
                data: values,
                backgroundColor: [
                  "#2563eb",
                  "#16a34a",
                  "#f59e0b",
                  "#dc2626",
                  "#7c3aed"
                ]
              }]
            }}
          />
        </div>

        <div style={styles.chartBox}>
          <h3>📋 Danh sách Top 5</h3>
          <ul style={{ paddingLeft: 20 }}>
            {data.bestProducts.map((p, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <strong>{p.name}</strong> – {p.totalSold} sản phẩm
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginTop: 25,
  },
  chartBox: {
    background: "white",
    padding: 24,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    marginTop: 30
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 30
  }
};

const Card = ({ title, value, color }) => (
  <div style={{
    background: "white",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
    borderLeft: `6px solid ${color}`
  }}>
    <p style={{ margin: 0, color: "#6b7280" }}>{title}</p>
    <h2 style={{ margin: "8px 0", color }}>{value}</h2>
  </div>
);

function formatMoney(v) {
  return Number(v || 0).toLocaleString("vi-VN") + " ₫";
}
