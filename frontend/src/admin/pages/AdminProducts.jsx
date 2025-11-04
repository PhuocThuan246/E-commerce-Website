import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import adminProductService from "../services/adminProductService";
import adminCategoryService from "../services/adminCategoryService";
import VariantModal from "../components/VariantModal";
import { SERVER_URL } from "../../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "", // ✅ thêm brand vào form
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [editId, setEditId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [prod, cat] = await Promise.all([
        adminProductService.getAll(),
        adminCategoryService.getAll(),
      ]);
      setProducts(prod.data);
      setCategories(cat.data);
    } catch {
      toast.error("Lỗi khi tải dữ liệu sản phẩm hoặc danh mục");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===============================
  // THÊM / SỬA SẢN PHẨM
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category)
      return toast.warning("Vui lòng nhập tên và danh mục!");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("brand", form.brand); // ✅ gửi brand lên server
      formData.append("description", form.description);
      if (form.image instanceof File) formData.append("image", form.image);

      if (editId) {
        await adminProductService.update(editId, formData);
        toast.success("Đã cập nhật sản phẩm!");
      } else {
        await adminProductService.create(formData);
        toast.success("Đã thêm sản phẩm!");
      }

      setForm({
        name: "",
        category: "",
        brand: "",
        description: "",
        image: "",
      });
      setImagePreview("");
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu sản phẩm");
    }
  };

  const handleDelete = async (id, name) => {
    setConfirmDelete(null);
    try {
      await adminProductService.delete(id);
      toast.success(`Đã xóa "${name}"`);
      fetchData();
    } catch {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  // ===============================
  // CHỈNH SỬA
  // ===============================
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category?._id || "",
      brand: product.brand || "", // ✅ nạp lại brand khi edit
      description: product.description || "",
      image: product.image || "",
    });
    setImagePreview(`${SERVER_URL}${product.image}`);
    setEditId(product._id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setForm({ name: "", category: "", brand: "", description: "", image: "" });
    setImagePreview("");
    setEditId(null);
    setShowForm(false);
  };

  // ===============================
  // XỬ LÝ ẢNH XEM TRƯỚC
  // ===============================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ===============================
  // GIAO DIỆN
  // ===============================
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 24, color: "#111827" }}>📦 Quản lý sản phẩm</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: 25,
          background: showForm ? "#9ca3af" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "10px 18px",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        {showForm ? "✖ Ẩn form" : "➕ Thêm sản phẩm"}
      </button>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 12,
            background: "#f9fafb",
            padding: 20,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            marginBottom: 35,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* TÊN SẢN PHẨM */}
          <input
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
          />

          {/* DANH MỤC */}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* ✅ THƯƠNG HIỆU */}
          <input
            placeholder="Thương hiệu (VD: Apple, Samsung...)"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
          />

          {/* ẢNH */}
          <input type="file" accept="image/*" onChange={handleImageChange} />

          {/* ẢNH XEM TRƯỚC */}
          {imagePreview && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Ảnh xem trước:</p>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
          )}

          {/* MÔ TẢ */}
          <textarea
            placeholder="Mô tả sản phẩm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
          ></textarea>

          {/* NÚT LƯU */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {editId ? "Cập nhật" : "Lưu sản phẩm"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  background: "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      )}

      {/* BẢNG SẢN PHẨM */}
      <div
        style={{
          background: "white",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              {["Tên", "Danh mục", "Thương hiệu", "Ảnh", "Biến thể", "Thao tác"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#374151",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                style={{
                  borderBottom: "1px solid #f3f4f6",
                  transition: "0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={{ padding: 10 }}>{p.name}</td>
                <td style={{ padding: 10 }}>{p.category?.name}</td>
                <td style={{ padding: 10 }}>{p.brand || "—"}</td>
                <td style={{ padding: 10 }}>
                  <img
                    src={p.image ? `${SERVER_URL}${p.image}` : "/no-image.png"}
                    alt={p.name}
                    width={60}
                    height={60}
                    style={{
                      borderRadius: 6,
                      objectFit: "cover",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </td>
                <td style={{ padding: 10 }}>{p.variants?.length || 0}</td>
                <td style={{ padding: 10 }}>
                  <button
                    onClick={() => setSelectedProduct(p)}
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      cursor: "pointer",
                      marginRight: 6,
                    }}
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => handleEdit(p)}
                    style={{
                      background: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      cursor: "pointer",
                      marginRight: 6,
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL BIẾN THỂ */}
      {selectedProduct && (
        <VariantModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onRefresh={fetchData}
        />
      )}

      {/* MODAL XÓA */}
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
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              textAlign: "center",
              width: 360,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Xác nhận xóa</h3>
            <p style={{ marginBottom: 20 }}>
              Bạn có chắc muốn xóa sản phẩm{" "}
              <strong style={{ color: "#ef4444" }}>{confirmDelete.name}</strong>?
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
