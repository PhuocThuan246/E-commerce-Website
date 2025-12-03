import React, { useEffect, useState, useMemo } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    sort: "default",
  });

  // Phân trang client
  const [page, setPage] = useState(1);
  const limit = 10;

  const [brandOptions, setBrandOptions] = useState([]);

  // ====== Hàm lấy giá chuẩn của sản phẩm ======
  const getPrice = (p) => {
    if (p.effectivePrice) return p.effectivePrice;

    if (p.variants?.length > 0) {
      const variantPrices = p.variants.map(
        (v) => v.effectivePrice || v.price || 0
      );
      return Math.min(...variantPrices);
    }

    return 0;
  };

  // ===============================
  // Lấy toàn bộ sản phẩm
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await productService.getAll();

        setProducts(data);

        // Lấy danh sách thương hiệu
        setBrandOptions([...new Set(data.map((p) => p.brand).filter(Boolean))]);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===============================
  // Lọc + Sắp xếp dùng useMemo (tối ưu hiệu năng)
  // ===============================
  const filteredProducts = useMemo(() => {
    const { search, brand, minPrice, maxPrice, rating, sort } = filters;

    let result = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(search.toLowerCase());
      const brandMatch = brand ? p.brand === brand : true;

      const price = getPrice(p);
      const priceMatch =
        (!minPrice || price >= Number(minPrice)) &&
        (!maxPrice || price <= Number(maxPrice));

      const ratingMatch =
        rating && rating !== ""
          ? (p.ratingAverage || 0) >= Number(rating)
          : true;

      return nameMatch && brandMatch && priceMatch && ratingMatch;
    });

    // ====== Sắp xếp ======
    result = result.sort((a, b) => {
      const priceA = getPrice(a);
      const priceB = getPrice(b);

      switch (filters.sort) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [products, filters]);

  // ===============================
  // Phân trang
  // ===============================
  const totalPages = Math.ceil(filteredProducts.length / limit);
  const startIndex = (page - 1) * limit;
  const currentPageProducts = filteredProducts.slice(
    startIndex,
    startIndex + limit
  );

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // ===============================
  // Render
  // ===============================
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
        Danh sách sản phẩm
      </h2>

      {/* ====== Bộ lọc ====== */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        {/* Tìm kiếm */}
        <input
          type="text"
          placeholder="Nhập sản phẩm cần tìm?"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            width: "200px",
          }}
        />

        {/* Thương hiệu */}
        <select
          value={filters.brand}
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option value="">Tất cả thương hiệu</option>
          {brandOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Giá */}
        <div>
          <input
            type="number"
            placeholder="Giá min"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            style={{ width: 90, padding: "6px", marginRight: 6 }}
          />
          <input
            type="number"
            placeholder="Giá max"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            style={{ width: 90, padding: "6px" }}
          />
        </div>

        {/* Rating */}
        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option value="">Tất cả xếp hạng</option>
          <option value="5">⭐ 5 sao</option>
          <option value="4">⭐ 4 sao trở lên</option>
          <option value="3">⭐ 3 sao trở lên</option>
          <option value="2">⭐ 2 sao trở lên</option>
          <option value="1">⭐ 1 sao trở lên</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
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

      {/* ====== Danh sách sản phẩm ====== */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải...</p>
      ) : currentPageProducts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 22,
            paddingLeft: 8,
            paddingRight: 8,
            alignItems: "stretch",
          }}
        >
          {currentPageProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>Không tìm thấy sản phẩm nào.</p>
      )}

      {/* ====== Phân trang ====== */}
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
              background: "#000",
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
                background: page === i + 1 ? "#000" : "#e5e7eb",
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
              background: "#000",
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
