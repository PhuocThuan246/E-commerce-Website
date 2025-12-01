import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";
import api from "../services/api";

// 🟥 Màu chủ đạo GearVN: đỏ đậm (#dc2626)
export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc đơn giản
  const [search, setSearch] = useState("");
  
  // ======= LẤY DỮ LIỆU =======
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

  useEffect(() => {
    (async () => {
      try {
        const [{ data: news }, { data: best }] = await Promise.all([
          productService.getNew(4),
          productService.getBestSellers(4),
        ]);
        setNewProducts(news);
        setBestSellers(best);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ================== GIAO DIỆN ==================
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      {/* ===== Banner ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          padding: "20px 40px",
        }}
      >
        <img
          src="/banners/banner1.jpg"
          alt="Main Banner"
          style={{
            width: "100%",
            borderRadius: 10,
            objectFit: "cover",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <img
            src="/banners/banner2.jpg"
            alt="Side Banner 1"
            style={{
              width: "100%",
              borderRadius: 10,
              objectFit: "cover",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          />
          <img
            src="/banners/banner3.jpg"
            alt="Side Banner 2"
            style={{
              width: "100%",
              borderRadius: 10,
              objectFit: "cover",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>

     

      {/* ===== Sản phẩm mới ===== */}
      <section className="section-container">
        <h2 className="section-title">Sản phẩm mới</h2>
        <div className="product-grid">
          {newProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* ===== Bán chạy ===== */}
      <section className="section-container">
        <h2 className="section-title">Bán chạy nhất</h2>
        <div className="product-grid">
          {bestSellers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* ===== Danh sách sản phẩm ===== */}
      <section className="section-container">
        <div className="filter-header">
          <h2 className="section-title">Tất cả sản phẩm</h2>
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              width: 220,
            }}
          />
        </div>

        <CategoryTabs active={activeCat} onChange={setActiveCat} />

        {loading ? (
          <p style={{ textAlign: "center" }}>Đang tải...</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ===== CSS nội tuyến ===== */}
      <style>
        {`
          .section-container {
            max-width: 1200px;
            margin: 0 auto 60px;
            padding: 0 20px;
          }

          .section-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #111827;
            border-left: 5px solid #dc2626;
            padding-left: 10px;
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            gap: 16px;
            justify-content: center;
          }

          .highlight-card {
            background: white;
            border-radius: 10px;
            padding: 14px 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            font-weight: 600;
            color: #dc2626;
            cursor: pointer;
            transition: 0.25s;
          }
          .highlight-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.12);
          }

          .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
          }

          @media (max-width: 900px) {
            .product-grid {
              grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            }
            .section-title {
              font-size: 18px;
            }
            .highlight-card {
              width: 45%;
              text-align: center;
            }
          }
        `}
      </style>
    </div>
  );
}
