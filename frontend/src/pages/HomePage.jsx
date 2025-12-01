import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";
import api from "../services/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 🟥 Màu chủ đạo: #dc2626
export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ======= LẤY DANH MỤC THẬT TỪ API =======
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh mục:", err);
      }
    })();
  }, []);

  // ======= LẤY SẢN PHẨM MỚI & BÁN CHẠY =======
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
        console.error("❌ Lỗi khi tải sản phẩm:", err);
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
      {/* 🔸 Banner dọc trái cố định */}
      <div
        style={{
          position: "fixed",
          top: 110,
          left: 10,
          zIndex: 50,
        }}
      >
        <img
          src="/banners/bannerside.jpg"
          alt="Banner trái"
          style={{
            width: 200,
            height: 600,
            borderRadius: 12,
            objectFit: "cover",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* 🔸 Banner dọc phải cố định */}
      <div
        style={{
          position: "fixed",
          top: 110,
          right: 10,
          zIndex: 50,
        }}
      >
        <img
          src="/banners/bannerside.jpg"
          alt="Banner phải"
          style={{
            width: 200,
            height: 600,
            borderRadius: 12,
            objectFit: "cover",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* ===== Banner chính + banner trái + banner phải ===== */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "280px 1.6fr 1fr", // ⬆ tăng độ rộng banner trái
    gap: 8, // giảm khoảng trống giữa các cột
    padding: "20px 180px", // ⬇ kéo tổng thể gần hơn hai bên
    alignItems: "stretch",
    marginLeft: "40px", // ⚙ giữ hợp lý để không đè banner side
  }}
>
  {/* 🔹 Banner trái (thay danh mục) */}
  <div
    style={{
      background: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
      marginLeft: "10px", // ✅ dịch sang trái gần banner side hơn
      maxHeight: "440px",
      width: "100%",
    }}
  >
    <img
      src="/banners/bannerleft.png"
      alt="Banner trái thay danh mục"
      style={{
        width: "105%", // ✅ phóng rộng hơn chút để banner to hơn
        height: "100%",
        objectFit: "cover",
        borderRadius: 10,
        display: "block",
      }}
    />
  </div>



        {/* 🔸 Slider chính */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            overflow: "hidden",
            transform: "scale(0.94)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
            transition: "0.3s",
          }}
        >
          <Slider
            autoplay
            autoplaySpeed={4000}
            infinite
            arrows={false}
            dots
            slidesToShow={1}
            slidesToScroll={1}
            pauseOnHover={false}
            cssEase="linear"
            adaptiveHeight
          >
            <div>
              <img
                src="/banners/banner1.jpg"
                alt="Main Banner 1"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <img
                src="/banners/banner1b.jpg"
                alt="Main Banner 2"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <img
                src="/banners/banner1c.jpg"
                alt="Main Banner 3"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            </div>
          </Slider>
        </div>

        {/* 🔹 Hai banner nhỏ bên phải */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transform: "scale(0.92)",
          }}
        >
          <img
            src="/banners/banner2.jpg"
            alt="Banner phải 1"
            style={{
              width: "80%",
              borderRadius: 10,
              objectFit: "cover",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          />
          <img
            src="/banners/banner3.jpg"
            alt="Banner phải 2"
            style={{
              width: "80%",
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

      {/* ===== Bán chạy nhất ===== */}
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



      <section className="section-container">
        <h2 className="section-title">Tin tức công nghệ</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20
        }}>
          {[
            { title: "Top 5 laptop gaming đáng mua cuối năm 2025", img: "/banners/top5.jpg" },
            { title: "RTX 5070 ra mắt – sức mạnh vượt trội", img: "/banners/5070.jpg" },
            { title: "So sánh Intel Core Ultra và Ryzen 8000", img: "/banners/intel.jpg" },
          ].map((b, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}>
              <img src={b.img} alt={b.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <div style={{ padding: "12px 16px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Cập nhật tin tức, đánh giá, và xu hướng công nghệ mới nhất...</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ===== CSS ===== */}
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
          .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
          }
          @media (max-width: 1200px) {
            div[style*="fixed"] { display: none; } /* Ẩn banner dọc trên mobile */
          }
          @media (max-width: 900px) {
            .product-grid {
              grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            }
            .section-title {
              font-size: 18px;
            }
          }
        `}
      </style>
    </div>
  );
}
