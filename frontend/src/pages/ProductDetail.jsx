import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import productService from "../services/productService";
import cartService from "../services/cartService";
import reviewService from "../services/reviewService";
import api, { SERVER_URL } from "../services/api";

// ========================= Helpers =========================
const buildImageUrl = (path) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${SERVER_URL}${path}`;
  return `${SERVER_URL}/${path}`;
};

export default function ProductDetail() {
  const { id } = useParams();
// ✅ Khi mở sản phẩm mới thì cuộn lên đầu trang
useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [id]);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: "", comment: "", rating: 0 });
  const [activeImage, setActiveImage] = useState(0);

  // socket
  useEffect(() => {
    const s = io(api.defaults.baseURL);
    s.emit("product:join", id);
    s.on("comment:new", (payload) => {
      if (payload.productId === id)
        setReviews((prev) => [
          payload.comment,
          ...prev
        ]);
    });

    s.on("rating:new", (payload) => {
      if (payload.productId === id) {
        setProduct((prev) => ({
          ...prev,
          ratingAverage: payload.ratingAverage,
          ratingCount: payload.ratingCount,
        }));
      }
    });
    return () => s.disconnect();
  }, [id]);

  // 📦 load product
  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await productService.getById(id);
        setProduct(data);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
      } catch (e) {
        toast.error("Không thể tải sản phẩm!");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // 💬 load reviews
  const fetchReviews = async () => {
    try {
      const { data } = await reviewService.getByProduct(id);
      setReviews(data.reviews || data);
    } catch (e) {
      console.error("Lỗi tải đánh giá:", e);
    }
  };
  useEffect(() => {
    fetchReviews();
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.fullName || user.name)
        setReviewForm((prev) => ({ ...prev, name: user.fullName || user.name }));
    }
  }, [id]);

  // build gallery
  const images = useMemo(() => {
    if (!product) return [];

    // chỉ lấy ảnh sản phẩm
    const productImgs = (product.images || []).map(buildImageUrl);

    // fallback nếu thiếu ảnh
    return productImgs.length ? productImgs : ["/no-image.png"];
  }, [product]);


  // ===================== CART =====================
  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error("Vui lòng chọn biến thể!");
    if (quantity > selectedVariant.stock)
      return toast.error(`Vượt tồn kho (${selectedVariant.stock})!`);
    try {
      const { data: cart } = await cartService.getCart();
      const existing = cart.items.find(
        (i) => i.product._id === product._id && i.variantId === selectedVariant._id
      );
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + quantity > selectedVariant.stock)
        return toast.error("Số lượng vượt tồn kho!");
      await cartService.addItem(product._id, quantity, selectedVariant._id);
      toast.success(`Đã thêm ${quantity} x ${product.name} (${selectedVariant.name})!`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (e) {
      toast.error("Lỗi khi thêm giỏ hàng!");
    }
  };

  // ===================== REVIEW =====================
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return toast.warning("Vui lòng nhập nội dung!");
    const token = localStorage.getItem("token");

    try {
      if (token && reviewForm.rating === 0)
        return toast.warning("Vui lòng chọn sao để đánh giá!");
      if (reviewForm.rating > 0) {
        await reviewService.addRating(id, reviewForm, token);
        toast.success("Đã gửi đánh giá!");
        setReviews((prev) => [
          {
            name: reviewForm.name,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            createdAt: new Date().toISOString(),
          },
          ...prev
        ]);

      } else {
        await reviewService.addComment(id, {
          name: reviewForm.name,
          comment: reviewForm.comment,
        });
        toast.success("Đã gửi bình luận!");
        setReviews((prev) => [
          { 
            name: reviewForm.name || "Khách ẩn danh",
            rating: 0,
            comment: reviewForm.comment,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);

      }
      setReviewForm((p) => ({ ...p, comment: "", rating: 0 }));
    } catch (err) {
      toast.error("Lỗi khi gửi đánh giá/bình luận!");
    }
  };

  // ===================== CAROUSEL =====================
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);

  // ===================== RENDER =====================
  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Đang tải...</p>;
  if (!product) return <p style={{ textAlign: "center", marginTop: 40 }}>Không tìm thấy sản phẩm!</p>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1150, margin: "0 auto" }}>
      <Link to="/" style={{ textDecoration: "none", color: "#000000ff" }}>
        ← Quay lại trang chủ
      </Link>

      {/* ===================== THÔNG TIN SẢN PHẨM ===================== */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 50, marginTop: 40, alignItems: "flex-start" }}>
        {/* ========== GALLERY ========== */}
        <div style={{ flex: "1 1 460px", textAlign: "center", position: "relative" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
          <img
            src={images[activeImage]}
            alt={`Ảnh ${activeImage + 1}`}
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: 380,      // giới hạn chiều cao
              objectFit: "contain",// thu nhỏ để vừa khung, không cắt
              borderRadius: 12,
              background: "#f9fafb",
              padding: 10,         // có viền trắng quanh ảnh cho đẹp
              boxSizing: "border-box",
            }}
          />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 10,
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
          <p style={{ marginTop: 8, color: "#6b7280" }}>
            Ảnh {activeImage + 1}/{images.length}
          </p>
        </div>

        {/* ========== CHI TIẾT ========== */}
        <div style={{ flex: "1 1 420px" }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>{product.name}</h1>
          <p style={{ color: "#6b7280", marginBottom: 6 }}>
            Thương hiệu: <strong>{product.brand || "Không rõ"}</strong> &nbsp;•&nbsp;
            Danh mục: <strong>{product.category?.name || "Không rõ"}</strong>
          </p>
          <p style={{ marginBottom: 10 }}>
            ⭐ <strong>{product.ratingAverage || 0}</strong> / 5{" "}
            <small style={{ color: "#6b7280" }}>({product.ratingCount || reviews.length} đánh giá)</small>
          </p>

          <div style={{ lineHeight: "1.65", color: "#374151", whiteSpace: "pre-line" }}>
            {product.description || "Chưa có mô tả."}
          </div>

          {/* Biến thể */}
          {product.variants?.length ? (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontWeight: 600 }}>Chọn biến thể:</label>
              <select
                value={selectedVariant?._id || ""}
                onChange={(e) =>
                  setSelectedVariant(product.variants.find((v) => v._id === e.target.value))
                }
                style={{
                  padding: "10px 14px",
                  marginTop: 8,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  width: "100%",
                }}
              >
                {product.variants.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} — {v.price?.toLocaleString() || 0} ₫ ({v.stock} còn lại)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>Không có biến thể cho sản phẩm này.</p>
          )}

          {/* Số lượng & giỏ */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600 }}>Số lượng:</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, border: "1px solid #d1d5db", borderRadius: 6 }}>-</button>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                style={{ width: 60, textAlign: "center", border: "1px solid #d1d5db", borderRadius: 6 }}
              />
              <button onClick={() => setQuantity((q) => Math.min((selectedVariant?.stock || 1), q + 1))}
                style={{ width: 36, height: 36, border: "1px solid #d1d5db", borderRadius: 6 }}>+</button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h2 style={{ color: "#16a34a", marginBottom: 12 }}>
              {(selectedVariant?.price || product.price || 0).toLocaleString()} ₫
            </h2>
            <button
              onClick={handleAddToCart}
              style={{
                background: "#111827", color: "white", padding: "12px 28px", border: "none",
                borderRadius: 8, cursor: "pointer", fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#111827")}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* ===================== REVIEWS ===================== */}
      <div style={{ marginTop: 60 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Nhận xét & Đánh giá</h2>

        <form onSubmit={handleReviewSubmit}
          style={{ background: "#f9fafb", padding: 16, borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Tên (tuỳ chọn)"
            value={reviewForm.name}
            readOnly={!!localStorage.getItem("token")}
            onChange={(e) => !localStorage.getItem("token") && setReviewForm({ ...reviewForm, name: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
          <textarea
            placeholder="Nội dung bình luận..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            rows={3}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
          <div>
            <label>Chấm sao (đăng nhập để gửi): </label>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s}
                style={{ fontSize: 22, color: reviewForm.rating >= s ? "#facc15" : "#d1d5db", cursor: "pointer", marginLeft: 6 }}
                onClick={() => setReviewForm((p) => ({ ...p, rating: p.rating === s ? 0 : s }))}>
                ★
              </span>
            ))}
          </div>
          <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 6, padding: "8px 16px", width: "fit-content" }}>
            Gửi
          </button>
        </form>

        {reviews.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Chưa có bình luận nào.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={i} style={{ background: "#fff", padding: 12, borderRadius: 8, marginTop: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{r.name || "Khách hàng"}</strong>
                <div>{[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} style={{ color: r.rating >= s ? "#facc15" : "#e5e7eb" }}>★</span>
                ))}</div>
              </div>
              <p style={{ marginTop: 6 }}>{r.comment}</p>
              <small style={{ color: "#9ca3af" }}>{new Date(r.createdAt).toLocaleString("vi-VN")}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
