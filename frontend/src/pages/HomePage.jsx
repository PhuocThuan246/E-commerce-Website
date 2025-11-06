import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";
import api from "../services/api"; // để gọi categories thật

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("");

  // Lấy danh mục từ DB
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    })();
  }, []);

  // Lấy sản phẩm mới + bán chạy
  useEffect(() => {
    (async () => {
      try {
        const [{ data: news }, { data: best }] = await Promise.all([
          productService.getNew(3),
          productService.getBestSellers(3),
        ]);
        setNewProducts(news);
        setBestSellers(best);
      } catch (err) {
        console.error("Lỗi khi tải New/Best:", err);
      }
    })();
  }, []);

  const fetchByCat = async (catId) => {
    setLoading(true);
    try {
      const { data } =
        catId === "all"
          ? await productService.getAll()
          : await productService.getByCategory(catId);
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchByCat(activeCat);
  }, [activeCat]);

  // Lọc dữ liệu theo tiêu chí
  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(search.toLowerCase());
    const brandMatch = brand ? p.brand === brand : true;
    const price = p.effectivePrice || (p.variants?.[0]?.effectivePrice ?? 0);
    const priceMatch =
      (!minPrice || price >= parseFloat(minPrice)) &&
      (!maxPrice || price <= parseFloat(maxPrice));
    const ratingMatch = rating ? p.rating >= parseInt(rating) : true;

    return nameMatch && brandMatch && priceMatch && ratingMatch;
  });

  return (
    <div style={{ display: "flex", padding: 24, gap: 16 }}>
      {/* ✅ SIDEBAR DANH MỤC */}
      <aside
        style={{
          width: 230,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "10px 0",
          height: "fit-content",
        }}
      >
        {categories.length > 0 ? (
          categories.map((c) => (
            <div
              key={c._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "white")}
              onClick={() => setActiveCat(c._id)}
            >
              <span style={{ fontSize: 15 }}>{c.name}</span>
              <span style={{ color: "#9ca3af" }}>›</span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#aaa" }}>Đang tải...</p>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1 }}>
        {/* Banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 260px",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <img
            src="/banners/main-banner.webp"
            alt="Main Banner"
            style={{
              width: "100%",
              borderRadius: 10,
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <img
              src="/banners/side1.webp"
              alt="Side Banner 1"
              style={{ width: "100%", borderRadius: 10 }}
            />
            <img
              src="/banners/side2.webp"
              alt="Side Banner 2"
              style={{ width: "100%", borderRadius: 10 }}
            />
          </div>
        </div>

        {/* New products */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#111827", marginBottom: 12 }}>✨ Sản phẩm mới</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {newProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#111827", marginBottom: 12 }}>🔥 Bán chạy nhất</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {bestSellers.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>

        {/* Lọc sản phẩm chính */}
        <h2 style={{ textAlign: "center", marginTop: 10 }}>
          🛍️ Danh sách sản phẩm
        </h2>

        {/* Bộ lọc */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <input
            type="text"
            placeholder="🔍 Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", width: "200px" }}
          />

          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
          >
            <option value="">Tất cả thương hiệu</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Xiaomi">Xiaomi</option>
            <option value="Oppo">Oppo</option>
          </select>

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

          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
          >
            <option value="">Tất cả xếp hạng</option>
            <option value="4">⭐ 4 sao trở lên</option>
            <option value="3">⭐ 3 sao trở lên</option>
            <option value="2">⭐ 2 sao trở lên</option>
          </select>
        </div>

        <CategoryTabs active={activeCat} onChange={setActiveCat} />

        {loading ? (
          <p style={{ textAlign: "center" }}>Đang tải...</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
