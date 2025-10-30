import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import productService from "../services/productService";
import cartService from "../services/cartService";
import { SERVER_URL } from "../services/api";


export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await productService.getById(id);
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) return <p style={{ textAlign: "center" }}>Đang tải...</p>;

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error("Vui lòng chọn biến thể sản phẩm!");

    if (quantity > selectedVariant.stock) {
      return toast.error(`Số lượng vượt quá tồn kho (${selectedVariant.stock})!`);
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
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng!");
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Link to="/" style={{ textDecoration: "none", color: "#2563eb", fontSize: 15 }}>
        ← Quay lại trang chủ
      </Link>

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

        {/* Thông tin chi tiết */}
        <div style={{ flex: "1 1 420px" }}>
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>{product.name}</h1>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Danh mục: <strong>{product.category?.name || "Không rõ"}</strong>
          </p>


          <p style={{ lineHeight: "1.6", color: "#374151" }}>{product.description}</p>

          {/* Biến thể */}
          <div style={{ marginTop: 25 }}>
            <label style={{ fontWeight: 600 }}>Chọn biến thể:</label>
            <select
              value={selectedVariant?._id}
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
                  {v.name} — {v.price.toLocaleString()} ₫ ({v.stock} còn lại)
                </option>
              ))}
            </select>
          </div>

          {/* Bộ chọn số lượng */}
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
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
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
                  setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))
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
              {(selectedVariant?.price || 0).toLocaleString()} ₫
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
    </div>
  );
}
