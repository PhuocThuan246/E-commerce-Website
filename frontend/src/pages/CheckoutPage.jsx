import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import cartService from "../services/cartService";
import orderService from "../services/orderService";
import discountService from "../services/discountService";
import api, { SERVER_URL } from "../services/api";
import { toast } from "react-toastify";

// Hàm dựng URL ảnh
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

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // thông tin giao hàng
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // địa chỉ đã lưu
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // mã giảm giá
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // loyalty
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // danh sách _id item đã chọn từ CartPage
  const selectedItems = location.state?.selectedItems || [];

  // ===============================
  // LOAD CART
  // ===============================
  const loadCart = async () => {
    try {
      const { data } = await cartService.getCart();
      setCart(data);
    } catch {
      toast.error("Không thể tải giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ===============================
  // LOAD ĐỊA CHỈ + LOYALTY KHI ĐÃ LOGIN
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // lấy danh sách địa chỉ
    api
      .get("/auth/addresses")
      .then((res) => {
        setAddresses(res.data);

        const defaultAddr = res.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);

          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

          setForm({
            name: defaultAddr.fullName,
            phone: defaultAddr.phone,
            email: storedUser.email || "",
            address: `${defaultAddr.street}, ${defaultAddr.ward}, ${defaultAddr.city}`,
          });
        }
      })
      .catch(() => console.log("Không tải được địa chỉ"));

    // lấy loyaltyPoints từ profile
    api
      .get("/auth/profile")
      .then((res) => {
        const lp = Number(res.data.loyaltyPoints ?? 0);
        setLoyaltyPoints(lp);

        // đồng bộ lại localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, loyaltyPoints: lp })
        );
      })
      .catch((e) => {
        console.log("Không tải được loyaltyPoints:", e);
      });
  }, []);

  // ===============================
  // FORM CHANGE
  // ===============================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ===============================
  // TÍNH TOÁN TỔNG TIỀN
  // ===============================
  if (loading) return <p style={{ textAlign: "center" }}>Đang tải.</p>;
  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Giỏ hàng trống, không thể thanh toán.
      </p>
    );

  // chỉ lấy các item user đã tick
  const selectedCartItems = cart.items.filter((item) =>
    selectedItems.includes(item._id)
  );

  if (selectedCartItems.length === 0)
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Bạn chưa chọn sản phẩm nào để thanh toán.
      </p>
    );

  const selectedSubtotal = selectedCartItems.reduce((sum, item) => {
    const product = item.product;
    const price = item.variant?.price || product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Giữ phí ship từ summary (nếu bạn đang dùng chung cho toàn đơn)
  const summary = cart.summary || {};
  const shippingFee = summary.shippingFee || 0;

  // VAT chỉ tính trên subtotal của sản phẩm đã chọn
  const TAX_RATE = 0.1; // 10%
  const tax = Math.round(selectedSubtotal * TAX_RATE);

  // tiền được trừ từ điểm
  const maxCanUse = selectedSubtotal + shippingFee + tax - discountAmount;
  const loyaltyDiscount = useLoyaltyPoints
    ? Math.min(loyaltyPoints * 1000, Math.max(maxCanUse, 0))
    : 0;

  const finalTotal = Math.max(
    selectedSubtotal + shippingFee + tax - discountAmount - loyaltyDiscount,
    0
  );

  // ===============================
  // ÁP DỤNG MÃ GIẢM GIÁ
  // ===============================
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.warning("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      setIsApplyingDiscount(true);
      setDiscountAmount(0);

      const res = await discountService.validate(
        discountCode.trim(),
        selectedSubtotal
      );

      setDiscountAmount(res.data.discountAmount || 0);
      toast.success(res.data.message || "Áp dụng mã giảm giá thành công!");
    } catch (err) {
      setDiscountAmount(0);
      toast.error(
        err.response?.data?.message || "Mã giảm giá không hợp lệ!"
      );
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // ===============================
  // SUBMIT ORDER
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      await orderService.createOrder({
        ...form,
        selectedItems,
        shippingFee,
        tax,
        discountCode: discountCode.trim() || null,
        discountAmount,
        useLoyaltyPoints, // gửi lên backend
      });

      toast.success("Đặt hàng thành công!");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/success");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi đặt hàng!");
    }
  };

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 15,
  };

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>🧾 Thanh toán</h1>

      {/* chọn địa chỉ nếu có nhiều */}
      {addresses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3>📍 Chọn địa chỉ giao hàng</h3>
          {addresses.map((addr) => (
            <label
              key={addr._id}
              style={{ display: "block", marginBottom: 10 }}
            >
              <input
                type="radio"
                name="addressSelect"
                checked={selectedAddressId === addr._id}
                onChange={() => {
                  setSelectedAddressId(addr._id);
                  setForm({
                    name: addr.fullName,
                    phone: addr.phone,
                    email: form.email,
                    address: `${addr.street}, ${addr.ward}, ${addr.city}`,
                  });
                }}
              />
              <span style={{ marginLeft: 8 }}>
                <strong>{addr.fullName}</strong> - {addr.phone}
                <br />
                {addr.street}, {addr.ward}, {addr.city}
                {addr.isDefault && (
                  <strong style={{ color: "#16a34a" }}> Mặc định</strong>
                )}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* sản phẩm đã chọn */}
      <div style={{ marginBottom: 30 }}>
        <h3>🛒 Sản phẩm đã chọn</h3>

        {selectedCartItems.map((item) => {
          const product = item.product;
          const variant =
            item.variant ||
            product?.variants?.find(
              (v) => v._id?.toString() === item.variantId?.toString()
            );

          const price = variant?.price || product.price;
          // CHỈ dùng ảnh sản phẩm
          const rawImage = product?.images?.[0] || null;

          const imageUrl = buildImageUrl(rawImage);



          return (
            <div
              key={item._id}
              style={{
                display: "flex",
                gap: 15,
                alignItems: "center",
                marginBottom: 12,
                padding: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              <img
                src={imageUrl}
                alt={product.name}
                style={{
                  width: 70,
                  height: 70,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />

              <div style={{ flex: 1 }}>
                <strong>{product.name}</strong>
                {variant && (
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    Biến thể: {variant.name}
                  </div>
                )}
                <div>Số lượng: {item.quantity}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div>{price.toLocaleString()} ₫</div>
                <div style={{ fontWeight: 600, color: "#dc2626" }}>
                  {(price * item.quantity).toLocaleString()} ₫
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* form + tóm tắt */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* form thông tin */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            name="name"
            placeholder="Họ tên người nhận"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <textarea
            name="address"
            placeholder="Địa chỉ giao hàng"
            value={form.address}
            onChange={handleChange}
            style={{ ...inputStyle, height: 80 }}
          />

          <button
            type="submit"
            style={{
              background: "#16a34a",
              color: "white",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            Xác nhận đặt hàng
          </button>
        </form>

        {/* tóm tắt đơn + mã + loyalty */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Tóm tắt đơn hàng</h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span>Tạm tính sản phẩm đã chọn</span>
            <span>{selectedSubtotal.toLocaleString()} ₫</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span>Thuế (VAT)</span>
            <span>{tax.toLocaleString()} ₫</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span>Phí vận chuyển</span>
            <span>{shippingFee.toLocaleString()} ₫</span>
          </div>

          {discountAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                color: "#16a34a",
              }}
            >
              <span>Giảm giá</span>
              <span>-{discountAmount.toLocaleString()} ₫</span>
            </div>
          )}

          {loyaltyDiscount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                color: "#16a34a",
              }}
            >
              <span>Trừ bằng điểm</span>
              <span>-{loyaltyDiscount.toLocaleString()} ₫</span>
            </div>
          )}

          <hr style={{ margin: "10px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <span>Tổng thanh toán</span>
            <span style={{ color: "#dc2626" }}>
              {finalTotal.toLocaleString()} ₫
            </span>
          </div>

          {/* mã giảm giá */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Mã giảm giá</h4>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="Nhập mã (5 ký tự)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                maxLength={5}
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={isApplyingDiscount}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#111827",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: isApplyingDiscount ? 0.7 : 1,
                }}
              >
                {isApplyingDiscount ? "Đang áp dụng..." : "Áp dụng"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              Mã gồm 5 ký tự, không có ngày hết hạn nhưng giới hạn số lần sử
              dụng theo quy định của quản trị viên.
            </p>
          </div>

          {/* loyalty */}
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, marginBottom: 6 }}>
              Bạn đang có{" "}
              <strong>{loyaltyPoints.toLocaleString()} điểm</strong> (≈{" "}
              {(loyaltyPoints * 1000).toLocaleString()} ₫).
            </p>
            <label
              style={{
                fontSize: 14,
                color: loyaltyPoints > 0 ? "#111827" : "#9ca3af",
              }}
            >
              <input
                type="checkbox"
                checked={useLoyaltyPoints}
                onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                disabled={loyaltyPoints <= 0}
              />
              <span style={{ marginLeft: 8 }}>
                Dùng toàn bộ điểm hiện có cho đơn này
                {loyaltyPoints <= 0 && " (hiện chưa có điểm để dùng)"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
