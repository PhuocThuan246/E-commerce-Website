import React, { useEffect, useState } from "react";
import categoryService from "../services/categoryService";

const wrap = { display: "flex", gap: 10, justifyContent: "center", margin: "12px 0 20px" };
const tabBase = (active) => ({
  border: "1px solid #e5e7eb",
  padding: "8px 14px",
  borderRadius: 999,
  cursor: "pointer",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#111827",
  fontWeight: 600,
});

export default function CategoryTabs({ active, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await categoryService.getAll();
        // Thêm "Tất cả" vào đầu danh sách
        setCategories([{ _id: "all", name: "Tất cả" }, ...data]);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div style={wrap}>
      {categories.map((c) => (
        <button
          key={c._id}
          style={tabBase(active === c._id)}
          onClick={() => onChange(c._id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
