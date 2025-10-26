import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import adminCategoryService from "../services/adminCategoryService";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // lưu danh mục đang cần xác nhận xóa

  // Lấy danh sách danh mục
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await adminCategoryService.getAll();
      setCategories(data);
    } catch (err) {
      toast.error("Lỗi khi tải danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Thêm danh mục mới
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Vui lòng nhập tên danh mục!");
    try {
      await adminCategoryService.create({ name });
      toast.success(`Đã thêm danh mục "${name}"`);
      setName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm danh mục");
    }
  };

  // Xóa danh mục (có xác nhận & xử lý ràng buộc)
  const handleDelete = async (id, catName) => {
    setConfirmDelete(null);
    try {
      await adminCategoryService.delete(id);
      toast.success(`Đã xóa danh mục "${catName}" thành công`);
      fetchData();
    } catch (err) {
        const msg = err.response?.data?.message || "Lỗi khi xóa danh mục";
        const count = err.response?.data?.productCount;

        if (count && count > 0) {
            toast.warning(`Không thể xóa "${catName}" vì đang có ${count} sản phẩm liên quan.`);
        } else if (msg.includes("sản phẩm")) {
            toast.warning(`Không thể xóa "${catName}": ${msg}`);
        } else {
            toast.error(`Lỗi khi xóa "${catName}": ${msg}`);
        }
    }

  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>🏷️ Quản lý danh mục</h2>

      {/* Form thêm danh mục */}
      <form onSubmit={handleAdd} style={{ display: "flex", alignItems: "center" }}>
        <input
          placeholder="Nhập tên danh mục..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            flex: 1,
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: 8,
            background: "#2563eb",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ➕ Thêm
        </button>
      </form>

      {/* Danh sách danh mục */}
      {loading ? (
        <p style={{ marginTop: 20 }}>⏳ Đang tải...</p>
      ) : (
        <ul style={{ marginTop: 20, listStyle: "none", padding: 0 }}>
          {categories.length === 0 ? (
            <p>Chưa có danh mục nào.</p>
          ) : (
            categories.map((c) => (
              <li
                key={c._id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  padding: 10,
                  borderRadius: 6,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <button
                  onClick={() => setConfirmDelete(c)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Xóa
                </button>
              </li>
            ))
          )}
        </ul>
      )}

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
              width: 350,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Xác nhận xóa</h3>
            <p style={{ marginBottom: 20 }}>
              Bạn có chắc muốn xóa danh mục{" "}
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
