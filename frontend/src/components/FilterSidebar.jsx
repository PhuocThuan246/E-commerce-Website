import React, { useEffect, useState } from "react";

export default function FilterSidebar({
  brands = [],
  selectedBrands = [],
  setSelectedBrands,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  rating,
  setRating,
  onApply,
  onReset,
}) {
  const [tempRating, setTempRating] = useState(rating || 0);

  // Danh sách lựa chọn sao
  const ratingOptions = [
    { value: 4.5, label: "Từ 4.5★ trở lên" },
    { value: 4, label: "Từ 4★ trở lên" },
    { value: 3.5, label: "Từ 3.5★ trở lên" },
    { value: 3, label: "Từ 3★ trở lên" },
    { value: 0, label: "Bỏ lọc rating" },
  ];

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleApply = () => {
    setRating(tempRating);
    onApply();
  };

  const handleReset = () => {
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setTempRating(0);
    setRating(0);
    onReset();
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        fontSize: 14,
        color: "#374151",
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Bộ lọc</h3>

      {/* ====== Thương hiệu ====== */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Thương hiệu *</label>
        {brands.length === 0 ? (
          <p style={{ color: "#9ca3af", marginTop: 4 }}>
            Chưa có dữ liệu thương hiệu
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginTop: 6,
              maxHeight: 140,
              overflowY: "auto",
            }}
          >
            {brands.map((brand) => (
              <label key={brand}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />{" "}
                {brand}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ====== Giá ====== */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Giá *</label>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{
              width: "100%",
              padding: 6,
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{
              width: "100%",
              padding: 6,
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        </div>
      </div>

      {/* ====== Xếp hạng ====== */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Xếp hạng</label>
        <div style={{ marginTop: 6 }}>
          {ratingOptions.map((opt) => (
            <div key={opt.value} style={{ marginTop: 4 }}>
              <label>
                <input
                  type="radio"
                  name="rating"
                  value={opt.value}
                  checked={tempRating === opt.value}
                  onChange={() => setTempRating(opt.value)}
                />{" "}
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ====== Nút hành động ====== */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleApply}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          Áp dụng
        </button>
        <button
          onClick={handleReset}
          style={{
            background: "#f3f4f6",
            color: "#111827",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
