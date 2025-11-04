// src/components/FilterSidebar.jsx
import { useEffect, useState } from "react";

const RATINGS = [4.5, 4, 3.5, 3];

export default function FilterSidebar({
  brandsOptions = [],
  initial = {},
  onApply,
}) {
  const [brands, setBrands] = useState(initial.brand?.split(",") || []);
  const [minPrice, setMinPrice] = useState(initial.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice || "");
  const [minRating, setMinRating] = useState(initial.minRating || "");

  useEffect(() => {
    setBrands(initial.brand?.split(",") || []);
    setMinPrice(initial.minPrice || "");
    setMaxPrice(initial.maxPrice || "");
    setMinRating(initial.minRating || "");
  }, [initial]);

  const toggleBrand = (b) => {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const apply = () => {
    onApply?.({
      brand: brands.length ? brands : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      page: 1, // reset trang
    });
  };

  const clear = () => {
    setBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    onApply?.({
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      page: 1,
    });
  };

  return (
    <aside className="fs-card">
      <h3 className="fs-title">Bộ lọc</h3>

      {/* Thương hiệu * bắt buộc */}
      <div className="fs-block">
        <div className="fs-label">Thương hiệu *</div>
        <div className="fs-brand-list">
          {brandsOptions.map((b) => (
            <label key={b} className="fs-check">
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={() => toggleBrand(b)}
              />
              <span>{b}</span>
            </label>
          ))}
          {!brandsOptions.length && (
            <div className="fs-empty">Chưa có dữ liệu thương hiệu</div>
          )}
        </div>
      </div>

      {/* Giá * bắt buộc (Min/Max) */}
      <div className="fs-block">
        <div className="fs-label">Giá *</div>
        <div className="fs-row">
          <input
            type="number"
            className="fs-input"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            className="fs-input"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Rating (tiêu chí thứ 3) */}
      <div className="fs-block">
        <div className="fs-label">Xếp hạng</div>
        <div className="fs-radio-col">
          {RATINGS.map((r) => (
            <label key={r} className="fs-radio">
              <input
                name="rating"
                type="radio"
                checked={String(minRating) === String(r)}
                onChange={() => setMinRating(r)}
              />
              <span>Từ {r}★ trở lên</span>
            </label>
          ))}
          <label className="fs-radio">
            <input
              name="rating"
              type="radio"
              checked={!minRating}
              onChange={() => setMinRating("")}
            />
            <span>Bỏ lọc rating</span>
          </label>
        </div>
      </div>

      <div className="fs-actions">
        <button onClick={apply} className="btn-primary w-50">Áp dụng</button>
        <button onClick={clear} className="btn-ghost w-50">Xoá lọc</button>
      </div>
    </aside>
  );
}
