import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cartService from "../services/cartService";
import { toast } from "react-toastify";
import { SERVER_URL } from "../services/api";

// Hàm build URL ảnh "thông minh"
// - Nếu path đã là URL đầy đủ (http/https) → dùng luôn
// - Nếu path bắt đầu bằng "/" → ghép SERVER_URL + path
// - Nếu path không có "/" → thêm "/" ở giữa
// - Nếu không có path → dùng ảnh mặc định
const buildImageUrl = (path) => {
  if (!path) return "/no-image.png";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${SERVER_URL}${path}`;
  }

  return `${SERVER_URL}/${path}`;
};

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  // --- Tải giỏ hàng từ backend (có cả summary: subtotal, tax, shippingFee, total) ---
  const loadCart = async () => {
    try {
      const { data } = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Xóa 1 sản phẩm ---
  const handleRemove = async (itemId) => {
    await cartService.removeItem(itemId);
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng!");
    await loadCart();
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    window.dispatchEvent(new Event("cartUpdated")); // cập nhật số lượng trên Header
  };

  // --- Xóa toàn bộ giỏ ---
  const handleClear = async () => {
    await cartService.clearCart();
    toast.info("Đã xóa toàn bộ giỏ hàng!");
    await loadCart();
    setSelectedItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- Cập nhật số lượng (có kiểm tra tồn kho) ---
  const handleQuantityChange = async (itemId, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.warning("⚠️ Số lượng vượt quá tồn kho!");
      return;
    }
    try {
      await cartService.updateQuantity(itemId, newQty);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể cập nhật số lượng!"
      );
    }
    await loadCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Đang tải giỏ hàng.</p>;
  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <p>🛍️ Giỏ hàng trống</p>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none" }}>
          ← Quay lại mua sắm
        </Link>
      </div>
    );

  // --- Tính tổng tiền CÁC SẢN PHẨM ĐƯỢC CHỌN ---
  const selectedTotal = cart.items
    .filter((item) => selectedItems.includes(item._id))
    .reduce(
      (sum, item) =>
        sum +
        (item.variant?.price || item.product?.price || 0) * item.quantity,
      0
    );

  // --- Lấy Cart Summary từ backend (toàn bộ giỏ) ---
  const summary = cart.summary || {};
  const { subtotal = 0, tax = 0, shippingFee = 0, total = 0 } = summary;

  // --- Toggle chọn 1 sản phẩm ---
  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // --- Chọn / bỏ chọn tất cả ---
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map((item) => item._id));
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ textAlign: "center" }}>🛒 Giỏ hàng của bạn</h1>

      <div style={{ maxWidth: 720, margin: "20px auto" }}>
        {/* Thanh chọn tất cả */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            type="checkbox"
            checked={selectedItems.length === cart.items.length}
            onChange={toggleSelectAll}
          />
          <span>
            Chọn tất cả ({selectedItems.length}/{cart.items.length})
          </span>
        </div>

        {/* Danh sách sản phẩm trong giỏ */}
        {cart.items.map((item) => {
          const product = item.product;
          const variant =
            item.variant ||
            product?.variants?.find(
              (v) => v._id?.toString() === item.variantId?.toString()
            );

          // Dùng hàm buildImageUrl thay vì ghép thẳng SERVER_URL
          const rawImage = product?.images?.[0] || null;


          const image = buildImageUrl(rawImage);


          const price = variant?.price || product?.price || 0;
          const stock = variant?.stock ?? product?.stock ?? 0;
          const outOfStock = stock <= 0;

          return (
            <div
              key={item._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
                padding: "12px 0",
                opacity: outOfStock ? 0.6 : 1, // làm mờ nếu hết hàng
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <input
                  type="checkbox"
                  disabled={outOfStock}
                  checked={selectedItems.includes(item._id) && !outOfStock}
                  onChange={() => toggleSelectItem(item._id)}
                />

                <img
                  src={image}
                  alt={variant?.name || product?.name}
                  width="80"
                  height="80"
                  style={{ borderRadius: 8, objectFit: "cover" }}
                />

                <div>
                  <h4 style={{ margin: 0 }}>{product?.name || "Sản phẩm"}</h4>
                  {variant && (
                    <p style={{ color: "#6b7280", margin: "2px 0" }}>
                      Biến thể: {variant.name}
                    </p>
                  )}
                  <p style={{ color: "#6b7280", margin: "4px 0" }}>
                    {Number(price).toLocaleString()} ₫
                  </p>

                  {/* Nếu hết hàng, hiện thông báo */}
                  {outOfStock ? (
                    <p style={{ color: "red", fontWeight: 600 }}>
                      ⚠️ Hết hàng
                    </p>
                  ) : (
                    <>
                      {/* Bộ điều chỉnh số lượng */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 6,
                        }}
                      >
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              item.quantity - 1,
                              stock
                            )
                          }
                          disabled={item.quantity <= 1}
                          style={{
                            width: 28,
                            height: 28,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            background: "white",
                            cursor:
                              item.quantity > 1 ? "pointer" : "not-allowed",
                            opacity: item.quantity > 1 ? 1 : 0.5,
                          }}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              Number(e.target.value),
                              stock
                            )
                          }
                          style={{
                            width: 45,
                            textAlign: "center",
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            padding: "4px 0",
                          }}
                        />

                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              item.quantity + 1,
                              stock
                            )
                          }
                          disabled={item.quantity >= stock}
                          style={{
                            width: 28,
                            height: 28,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            background: "white",
                            cursor:
                              item.quantity < stock ? "pointer" : "not-allowed",
                            opacity: item.quantity < stock ? 1 : 0.5,
                          }}
                        >
                          +
                        </button>
                      </div>

                      <p style={{ fontWeight: 600, marginTop: 8 }}>
                        = {(price * item.quantity).toLocaleString()} ₫
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleRemove(item._id)}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          );
        })}

        {/* Khu vực tổng cộng */}
        <div style={{ textAlign: "right", marginTop: 20 }}>
          {/* Tổng của các sản phẩm đang được chọn để đi đến Checkout */}
          <h3>
            Tổng tiền sản phẩm đã chọn: {selectedTotal.toLocaleString()} ₫
          </h3>

          {/* Cart Summary toàn bộ giỏ từ backend (phục vụ yêu cầu đề tài) */}
          {cart.summary && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px dashed #d1d5db",
                fontSize: 14,
                color: "#4b5563",
              }}
            >
              <div>Tạm tính (tất cả sản phẩm): {subtotal.toLocaleString()} ₫</div>
              <div>Thuế (VAT): {tax.toLocaleString()} ₫</div>
              <div>Phí vận chuyển: {shippingFee.toLocaleString()} ₫</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>
                Tổng tiền phải trả (toàn bộ giỏ): {total.toLocaleString()} ₫
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              onClick={handleClear}
              style={{
                padding: "10px 20px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Xóa toàn bộ giỏ
            </button>

            <Link
              to="/checkout"
              state={{ selectedItems }}
              style={{
                background: "#16a34a",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                textDecoration: "none",
                pointerEvents: selectedItems.length === 0 ? "none" : "auto",
                opacity: selectedItems.length === 0 ? 0.5 : 1,
              }}
            >
              Thanh toán ({selectedItems.length})
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/" style={{ color: "#000000ff", textDecoration: "none" }}>
            ← Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
