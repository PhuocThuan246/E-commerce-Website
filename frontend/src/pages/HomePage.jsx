import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("all");
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: news }, { data: best }] = await Promise.all([
          // Chỗ này là chỉnh số lượng Sản phẩm mới và Best Seller
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

  return (
    <div style={{ padding: 24 }}>
      {/* Section: New Products */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#111827", marginBottom: 12 }}>✨ New Products</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {newProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Section: Best Sellers */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#111827", marginBottom: 12 }}>🔥 Best Sellers</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {bestSellers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Section: Categories */}
      <h2 style={{ textAlign: "center", marginTop: 10 }}>🛍️ Danh sách sản phẩm</h2>
      <CategoryTabs active={activeCat} onChange={setActiveCat} />

      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải...</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
