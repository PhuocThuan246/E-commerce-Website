import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client"; // ✅ thêm socket
import productService from "../services/productService";
import cartService from "../services/cartService";
import reviewService from "../services/reviewService";
import api, { SERVER_URL } from "../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // 💬 Đánh giá / Bình luận
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    comment: "",
    rating: 0,
  });

  // 🔌 SocketIO client
  const [socket, setSocket] = useState(null);

  // 📦 Lấy thông tin sản phẩm
  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await productService.getById(id);
        if (!data) {
          toast.error("Không tìm thấy sản phẩm!");
          return;
        }
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm:", err);
        toast.error("Không thể tải sản phẩm!");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // 💬 Lấy danh sách đánh giá
  const fetchReviews = async () => {
    try {
      const { data } = await reviewService.getByProduct(id);
      setReviews(data.reviews || data);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.fullName || storedUser.name) {
        setReviewForm((prev) => ({
          ...prev,
          name: storedUser.fullName || storedUser.name, // ✅ lấy đúng tên hiển thị ở Header
        }));
      }
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // 🔌 Kết nối Socket.IO
  useEffect(() => {
    const s = io(api.defaults.baseURL);
    s.emit("product:join", id);

    s.on("comment:new", (payload) => {
      if (payload.productId === id) {
        setReviews((prev) => [...prev, payload.comment]);
      }
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

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [id]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Đang tải...</p>;

  if (!product)
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        ❌ Không tìm thấy sản phẩm!
      </p>
    );

  // 🛒 Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!selectedVariant)
      return toast.error("Vui lòng chọn biến thể sản phẩm!");
    if (quantity > selectedVariant.stock) {
      return toast.error(
        `Số lượng vượt quá tồn kho (${selectedVariant.stock})!`
      );
    }

    try {
      const { data: cart } = await cartService.getCart();
      const existingItem = cart.items.find(
        (item) =>
          item.product._id === product._id &&
          item.variantId === selectedVariant._id
      );
      const currentQty = existingItem ? existingItem.quantity : 0;
      const totalQty = currentQty + quantity;
      if (totalQty > selectedVariant.stock) {
        return toast.error(
          `Bạn đã có ${currentQty} sản phẩm trong giỏ. Tổng ${totalQty} vượt quá tồn kho (${selectedVariant.stock}).`
        );
      }
      await cartService.addItem(product._id, quantity, selectedVariant._id);
      toast.success(
        `Đã thêm ${quantity} x ${product.name} (${selectedVariant.name}) vào giỏ hàng!`
      );
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng!"
      );
    }
  };

  // 💬 Gửi bình luận hoặc đánh giá
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.warning("Vui lòng nhập nội dung!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // 🛑 Nếu đã đăng nhập nhưng không chọn sao -> không cho gửi bình luận thuần
      if (token && reviewForm.rating === 0) {
        toast.warning("Vui lòng chọn số sao để đánh giá!");
        return;
      }

      // ⭐ Có rating > 0 -> gửi /ratings + token
      if (reviewForm.rating > 0) {
        await reviewService.addRating(id, reviewForm, token);
        toast.success("Đã gửi đánh giá!");

        // ✅ Hiển thị ngay trên UI
        setReviews((prev) => [
          ...prev,
          {
            name: reviewForm.name || "Bạn",
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        // 💬 Chưa đăng nhập -> bình luận thường
        await reviewService.addComment(id, {
          name: reviewForm.name,
          comment: reviewForm.comment,
        });
        toast.success("Đã gửi bình luận!");

        // ✅ Hiển thị ngay trên UI
        setReviews((prev) => [
          ...prev,
          {
            name: reviewForm.name || "Khách ẩn danh",
            rating: 0,
            comment: reviewForm.comment,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      // Reset form
      setReviewForm((prev) => ({
        ...prev,
        comment: "",
        rating: 0,
      }));

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi gửi bình luận/đánh giá!"
      );
    }
  };



  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Link
        to="/"
        style={{ textDecoration: "none", color: "#2563eb", fontSize: 15 }}
      >
        ← Quay lại trang chủ
      </Link>

      {/* ===================== THÔNG TIN SẢN PHẨM ===================== */}
      <div
        style={{
          display: "flex",
          gap: 60,
          marginTop: 40,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* Ảnh sản phẩm */}
        <div
          style={{
            flex: "1 1 380px",
            textAlign: "center",
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={
              selectedVariant?.image
                ? `${SERVER_URL}${selectedVariant.image}`
                : product.image
                  ? `${SERVER_URL}${product.image}`
                  : "/no-image.png"
            }
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: 400,
              height: "auto",
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
        </div>

        {/* Chi tiết sản phẩm */}
        <div style={{ flex: "1 1 420px" }}>
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>{product.name}</h1>

          <p style={{ color: "#6b7280", marginBottom: 10 }}>
            Danh mục: <strong>{product.category?.name || "Không rõ"}</strong>
          </p>

          <p style={{ marginBottom: 10 }}>
            ⭐ <strong>{product.ratingAverage || 0}</strong> / 5{" "}
            <small style={{ color: "#6b7280" }}>
              ({product.ratingCount || reviews.length} đánh giá)
            </small>
          </p>

          <p style={{ lineHeight: "1.6", color: "#374151" }}>
            {product.description}
          </p>

          {/* Biến thể */}
          {product.variants && product.variants.length > 0 ? (
            <div style={{ marginTop: 25 }}>
              <label style={{ fontWeight: 600 }}>Chọn biến thể:</label>
              <select
                value={selectedVariant?._id || ""}
                onChange={(e) =>
                  setSelectedVariant(
                    product.variants.find((v) => v._id === e.target.value)
                  )
                }
                style={{
                  padding: "10px 14px",
                  marginTop: 8,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  width: "100%",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                {product.variants.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} — {v.price?.toLocaleString() || 0} ₫ ({v.stock}{" "}
                    còn lại)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p style={{ marginTop: 20, color: "#6b7280" }}>
              Không có biến thể cho sản phẩm này.
            </p>
          )}

          {/* Số lượng */}
          <div style={{ marginTop: 25 }}>
            <label style={{ fontWeight: 600 }}>Số lượng:</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  background: "#f9fafb",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                style={{
                  width: 60,
                  textAlign: "center",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "6px 0",
                }}
              />
              <button
                onClick={() =>
                  setQuantity(
                    Math.min(selectedVariant?.stock || 1, quantity + 1)
                  )
                }
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  background: "#f9fafb",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Giá & nút thêm */}
          <div style={{ marginTop: 30 }}>
            <h2 style={{ color: "#16a34a", marginBottom: 20 }}>
              {(selectedVariant?.price || product.price || 0).toLocaleString()} ₫
            </h2>

            <button
              onClick={handleAddToCart}
              style={{
                background: "#111827",
                color: "white",
                padding: "12px 28px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#2563eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#111827")
              }
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* ===================== ĐÁNH GIÁ & NHẬN XÉT ===================== */}
      <div style={{ marginTop: 60 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>💬 Nhận xét & Đánh giá</h2>

        {/* Form gửi bình luận / đánh giá */}
        <form
          onSubmit={handleReviewSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "#f9fafb",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          {/* ✅ Ô tên — tự động lấy tên khi đã đăng nhập */}
          <input
            placeholder="Tên (tuỳ chọn)"
            value={reviewForm.name}
            readOnly={!!localStorage.getItem("token")}
            onChange={(e) =>
              !localStorage.getItem("token") &&
              setReviewForm({ ...reviewForm, name: e.target.value })
            }
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: localStorage.getItem("token") ? "#e5e7eb" : "white",
              cursor: localStorage.getItem("token") ? "not-allowed" : "text",
            }}
          />


          <textarea
            placeholder="Nội dung bình luận..."
            value={reviewForm.comment}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, comment: e.target.value })
            }
            rows={3}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
          ></textarea>

          <div>
            <label>Chấm sao (đăng nhập để gửi):</label>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 22,
                    color: reviewForm.rating >= s ? "#facc15" : "#d1d5db",
                    cursor: "pointer",
                    marginLeft: 6,
                  }}
                  onClick={() => {
                    setReviewForm((prev) => ({
                      ...prev,
                      rating: prev.rating === s ? 0 : s, // ✅ bấm lại thì xoá sao
                    }));
                  }}
                >
                  ★
                </span>
              ))}
          </div>

          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              width: "fit-content",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Gửi
          </button>
        </form>


        {/* Danh sách đánh giá */}
        {reviews.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Chưa có bình luận nào.</p>
        ) : (
          reviews.map((r, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{r.name || "Khách hàng"}</strong>
                <div>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{
                        color: r.rating >= s ? "#facc15" : "#e5e7eb",
                        fontSize: 18,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p style={{ margin: "6px 0 0", color: "#374151" }}>
                {r.comment}
              </p>
              <small style={{ color: "#9ca3af" }}>
                {new Date(r.createdAt).toLocaleString("vi-VN")}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
