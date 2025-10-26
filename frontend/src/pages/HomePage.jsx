import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy toàn bộ sản phẩm
  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    }
    setLoading(false);
  };

  //  Lấy sản phẩm theo category ID
  const fetchByCat = async (catId) => {
    if (catId === "all") return fetchAll();
    setLoading(true);
    try {
      const { data } = await productService.getByCategory(catId);
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm theo danh mục:", error);
    }
    setLoading(false);
  };

  // Chạy khi khởi tạo & khi đổi danh mục
  useEffect(() => {
    fetchByCat(activeCat);
  }, [activeCat]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ textAlign: "center", marginTop: 6 }}>🛍️ Danh sách sản phẩm</h1>

      <CategoryTabs active={activeCat} onChange={setActiveCat} />

      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải...</p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center" }}>Không có sản phẩm.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
