import React, { useState } from "react";
import { toast } from "react-toastify";
import adminProductService from "../services/adminProductService";

export default function VariantModal({ product, onClose, onRefresh }) {
  const parseDigits = (val) => {
    const n = Number(String(val || "").replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  };

  const [variants, setVariants] = useState(product.variants || []);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    image: "",
  });
  const [editVariant, setEditVariant] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // hộp thoại xác nhận xóa

  // ===============================
  // Lưu / Cập nhật (cập nhật UI ngay)
  // ===============================
  const handleSave = async () => {
    try {
      if (!form.name.trim()) return toast.warning("⚠️ Nhập tên biến thể!");
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: parseDigits(form.price),
        stock: parseDigits(form.stock),
        image: form.image.trim(),
      };

      if (editVariant) {
        const { data: updated } = await adminProductService.updateVariant(
          product._id,
          editVariant._id,
          payload
        );
        setVariants((prev) =>
          prev.map((v) => (v._id === updated._id ? updated : v))
        );
        toast.success("Đã cập nhật biến thể");
      } else {
        const { data: created } = await adminProductService.addVariant(
          product._id,
          payload
        );
        setVariants((prev) => [...prev, created]);
        toast.success("Đã thêm biến thể mới");
      }

      setForm({ name: "", sku: "", price: "", stock: "", image: "" });
      setEditVariant(null);
      onRefresh && onRefresh();
    } catch {
      toast.error("Lỗi khi lưu biến thể");
    }
  };

  // ===============================
  // Xóa biến thể
  // ===============================
  const handleDelete = async (variantId, name) => {
    setConfirmDelete(null); // đóng modal
    try {
      await adminProductService.removeVariant(product._id, variantId);
      setVariants((prev) => prev.filter((v) => v._id !== variantId));
      toast.success(`Đã xóa biến thể "${name}"`);
      onRefresh && onRefresh();
    } catch {
      toast.error("Lỗi khi xóa biến thể");
    }
  };

  // ===============================
  // Bắt đầu chỉnh sửa
  // ===============================
  const handleEdit = (v) => {
    setEditVariant(v);
    setForm({
      name: v.name || "",
      sku: v.sku || "",
      price: String(v.price ?? ""),
      stock: String(v.stock ?? ""),
      image: v.image || "",
    });
  };

  // ===============================
  // Hủy chỉnh sửa
  // ===============================
  const handleCancelEdit = () => {
    setEditVariant(null);
    setForm({ name: "", sku: "", price: "", stock: "", image: "" });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          width: 550,
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h3>
          ⚙️ Quản lý biến thể: <strong>{product.name}</strong>
        </h3>

        {/* DANH SÁCH BIẾN THỂ */}
        {variants.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Chưa có biến thể nào.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
            {variants.map((v) => (
              <li
                key={v._id}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={v.image || "/no-image.png"}
                    alt={v.name}
                    width={50}
                    height={50}
                    style={{ borderRadius: 6, border: "1px solid #e5e7eb" }}
                  />
                  <span>
                    <strong>{v.name}</strong> —{" "}
                    {Number(v.price).toLocaleString("vi-VN")} ₫ (
                    {Number(v.stock)} tồn)
                    {v.sku && (
                      <span style={{ color: "#6b7280", marginLeft: 6 }}>
                        — SKU: {v.sku}
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(v)}
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 8px",
                      marginRight: 6,
                      cursor: "pointer",
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(v)} // hiển thị modal xác nhận
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* FORM THÊM / SỬA BIẾN THỂ */}
        <h4 style={{ marginTop: 20, borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
          {editVariant ? "✏️ Chỉnh sửa biến thể" : "➕ Thêm biến thể mới"}
        </h4>

        <div
          style={{
            display: "grid",
            gap: 10,
            background: "#f9fafb",
            padding: 15,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        >
          <input
            placeholder="Tên biến thể"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
          <input
            type="text"
            placeholder="Giá (₫)"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value.replace(/[^\d]/g, ""),
              })
            }
          />
          <input
            type="text"
            placeholder="Tồn kho"
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock: e.target.value.replace(/[^\d]/g, ""),
              })
            }
          />
          <input
            type="text"
            placeholder="Link ảnh biến thể"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          {form.image && (
            <div style={{ textAlign: "center", marginTop: 6 }}>
              <img
                src={form.image}
                alt="Preview"
                width={100}
                height={100}
                style={{
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  objectFit: "cover",
                }}
              />
              <p style={{ fontSize: 12, color: "#6b7280" }}>Ảnh xem trước</p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={handleSave}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              💾 {editVariant ? "Cập nhật" : "Lưu biến thể"}
            </button>
            {editVariant && (
              <button
                onClick={handleCancelEdit}
                style={{
                  background: "#9ca3af",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          ✖ Đóng
        </button>
      </div>

      {/* Hộp thoại xác nhận xoá */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              textAlign: "center",
              width: 350,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Xác nhận xóa</h3>
            <p style={{ marginBottom: 20 }}>
              Bạn có chắc muốn xóa biến thể{" "}
              <strong style={{ color: "#ef4444" }}>
                {confirmDelete.name}
              </strong>{" "}
              không?
            </p>

            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: "#9ca3af",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  handleDelete(confirmDelete._id, confirmDelete.name)
                }
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
