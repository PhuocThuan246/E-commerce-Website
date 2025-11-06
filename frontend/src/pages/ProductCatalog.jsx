import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState("default");

  // ✅ Phân trang client
  const [page, setPage] = useState(1);
  const limit = 10;

  const [brandOptions, setBrandOptions] = useState([]);

  // ✅ Lấy toàn bộ sản phẩm từ DB
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await productService.getAll();
        setProducts(data);
        const uniqueBrands = [
          ...new Set(data.map((p) => p.brand).filter(Boolean)),
        ];
        setBrandOptions(uniqueBrands);
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Lọc dữ liệu realtime
  const filteredProducts = products
    .filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(search.toLowerCase());
      const brandMatch = brand ? p.brand === brand : true;
      const price = p.effectivePrice || (p.variants?.[0]?.effectivePrice ?? 0);
      const priceMatch =
        (!minPrice || price >= parseFloat(minPrice)) &&
        (!maxPrice || price <= parseFloat(maxPrice));
      // ⭐ Lọc theo số sao trung bình
      const ratingMatch = rating ? (p.ratingAverage || 0) >= parseFloat(rating) : true;
      return nameMatch && brandMatch && priceMatch && ratingMatch;
    })
    .sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (a.effectivePrice ?? 0) - (b.effectivePrice ?? 0);
        case "price_desc":
          return (b.effectivePrice ?? 0) - (a.effectivePrice ?? 0);
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  // ✅ Phân trang client-side
  const totalPages = Math.ceil(filteredProducts.length / limit);
  const startIndex = (page - 1) * limit;
  const currentPageProducts = filteredProducts.slice(
    startIndex,
    startIndex + limit
  );

  // Reset page nếu filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [search, brand, minPrice, maxPrice, rating, sort]);

  return (
    <div style={{ padding: 24 }}>
      <h2
        style={{
          color: "#111827",
          fontSize: 26,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🛒 Danh sách sản phẩm
      </h2>

      {/* Bộ lọc */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        {/* 🔍 Tìm kiếm realtime */}
        <input
          type="text"
          placeholder="🔍 Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            width: "200px",
          }}
        />

        {/* ✅ Lọc thương hiệu */}
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option value="">Tất cả thương hiệu</option>
          {brandOptions.length > 0 ? (
            brandOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))
          ) : (
            <>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Oppo">Oppo</option>
            </>
          )}
        </select>

        {/* 💰 Giá */}
        <div>
          <input
            type="number"
            placeholder="Giá min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ width: 90, padding: "6px", marginRight: 6 }}
          />
          <input
            type="number"
            placeholder="Giá max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ width: 90, padding: "6px" }}
          />
        </div>

        {/* ⭐ Lọc theo sao */}
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option value="">Tất cả xếp hạng</option>
          <option value="5">⭐ 5 sao </option>
          <option value="4">⭐ 4 sao trở lên</option>
          <option value="3">⭐ 3 sao trở lên</option>
          <option value="2">⭐ 2 sao trở lên</option>
          <option value="1">⭐ 1 sao trở lên</option>
        </select>

        {/* 🔽 Sắp xếp */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <option value="default">-- Sắp xếp mặc định --</option>
          <option value="name_asc">Tên (A → Z)</option>
          <option value="name_desc">Tên (Z → A)</option>
          <option value="price_asc">Giá (thấp → cao)</option>
          <option value="price_desc">Giá (cao → thấp)</option>
        </select>
      </div>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải...</p>
      ) : currentPageProducts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
          }}
        >
          {currentPageProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>Không tìm thấy sản phẩm nào.</p>
      )}

      {/* ✅ Phân trang client-side */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 12px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            ⬅ Trước
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                background: page === i + 1 ? "#2563eb" : "#e5e7eb",
                color: page === i + 1 ? "white" : "#111827",
                border: "none",
                borderRadius: 6,
                padding: "8px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 12px",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            Sau ➡
          </button>
        </div>
      )}
    </div>
  );
}
