import React, { useEffect, useState } from "react";
import adminDiscountService from "../services/adminDiscountService";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: 10,
    maxUsage: 10,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  async function fetchDiscounts() {
    try {
      setLoading(true);
      const { data } = await adminDiscountService.getAll();
      setDiscounts(data || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách mã giảm giá!");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "value" || name === "maxUsage" ? Number(value) : value,
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (form.maxUsage < 1 || form.maxUsage > 10) {
      alert("Số lần sử dụng tối đa phải từ 1 đến 10.");
      return;
    }
    if (!form.value || form.value <= 0) {
      alert("Giá trị giảm phải > 0.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...form };
      if (!payload.code.trim()) {
        delete payload.code; // để backend tự random
      }

      const { data } = await adminDiscountService.create(payload);
      setDiscounts((prev) => [data, ...prev]);
      setForm({ code: "", type: "percent", value: 10, maxUsage: 10 });
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Lỗi khi tạo mã giảm giá, thử lại sau."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatMoney(v) {
    if (v == null) return "0";
    return Number(v).toLocaleString("vi-VN");
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16, color: "#111827" }}>
        🎫 Quản lý mã giảm giá
      </h2>

      {/* Form tạo mã */}
      <div
        style={{
          marginBottom: 24,
          background: "#fff",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: 15, marginBottom: 8 }}>
          Tạo mã giảm giá mới
        </h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Nếu bỏ trống ô mã, hệ thống sẽ tự sinh ngẫu nhiên 5 ký tự.
          Theo đề, số lần sử dụng tối đa không vượt quá 10.
        </p>
        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <div>
            <label style={label}>Mã (5 ký tự)</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              maxLength={5}
              style={input}
              placeholder="VD: ABC12"
            />
          </div>
          <div>
            <label style={label}>Loại</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={input}
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định</option>
            </select>
          </div>
          <div>
            <label style={label}>
              Giá trị {form.type === "percent" ? "(%)" : "(VND)"}
            </label>
            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              min={1}
              style={input}
            />
          </div>
          <div>
            <label style={label}>Số lần tối đa (≤10)</label>
            <input
              type="number"
              name="maxUsage"
              value={form.maxUsage}
              onChange={handleChange}
              min={1}
              max={10}
              style={input}
            />
          </div>
          <div style={{ gridColumn: "span 4", textAlign: "right" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "#111827",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {submitting ? "Đang tạo..." : "Tạo mã"}
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách mã */}
      {loading ? (
        <p>Đang tải danh sách mã giảm giá...</p>
      ) : discounts.length === 0 ? (
        <p>Chưa có mã giảm giá nào.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={th}>Mã</th>
              <th style={th}>Loại</th>
              <th style={th}>Giá trị</th>
              <th style={th}>Đã dùng / Tối đa</th>
              <th style={th}>Ngày tạo</th>
              <th style={th}>Đơn hàng đã dùng</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((dc) => (
              <tr key={dc._id}>
                <td style={td}>
                  <b>{dc.code}</b>
                </td>
                <td style={td}>{dc.type === "percent" ? "Phần trăm" : "Cố định"}</td>
                <td style={td}>
                  {dc.type === "percent"
                    ? `${dc.value}%`
                    : `${formatMoney(dc.value)} ₫`}
                </td>
                <td style={td}>
                  {dc.usedCount}/{dc.maxUsage}
                </td>
                <td style={td}>
                  {new Date(dc.createdAt).toLocaleString("vi-VN")}
                </td>
                <td style={td}>
                  {dc.orders && dc.orders.length > 0 ? (
                    <ul
                      style={{
                        paddingLeft: 16,
                        margin: 0,
                        fontSize: 12,
                        maxHeight: 120,
                        overflowY: "auto",
                      }}
                    >
                      {dc.orders.map((o) => (
                        <li key={o._id}>
                          #{o._id.slice(-6).toUpperCase()} —{" "}
                          {o.customer?.name || "Khách"} —{" "}
                          {Number(o.total).toLocaleString("vi-VN")} ₫ (
                          {new Date(o.createdAt).toLocaleDateString("vi-VN")})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Chưa có đơn sử dụng
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const label = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
};

const input = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 13,
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
