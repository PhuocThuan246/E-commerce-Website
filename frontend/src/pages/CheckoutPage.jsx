import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cartService from "../services/cartService";
import orderService from "../services/orderService";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  const loadCart = async () => {
    try {
      const { data } = await cartService.getCart();

      // Lọc sản phẩm được chọn
      let filteredItems = data.items;
      if (selectedItems.length > 0) {
        filteredItems = data.items.filter((i) =>
          selectedItems.includes(i._id)
        );
      }

      // Bổ sung variant thực tế
      const enrichedItems = filteredItems.map((i) => {
        const variant =
          i.variant ||
          i.product.variants?.find(
            (v) => v._id?.toString() === i.variantId?.toString()
          );
        return { ...i, variant };
      });

      setCart({ ...data, items: enrichedItems });
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      toast.error("Không thể tải giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      });
      toast.success("Đặt hàng thành công!");
      navigate("/success");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi đặt hàng!");
    }
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Đang tải giỏ hàng...</p>;

  const total = cart.items.reduce(
    (sum, i) =>
      sum + (i.variant?.price || i.product?.price || 0) * i.quantity,
    0
  );

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 15,
    outline: "none",
    transition: "border 0.2s",
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: 900,
        margin: "0 auto",
        background: "#f9fafb",
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#111827",
          marginBottom: 30,
          fontSize: 28,
        }}
      >
        🧾 Thanh toán đơn hàng
      </h1>

      {/* --- Tóm tắt đơn hàng --- */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          marginBottom: 30,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            marginBottom: 15,
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: 8,
          }}
        >
          🛍️ Sản phẩm bạn đã chọn
        </h3>

        {cart.items.map((i) => (
          <div
            key={i._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={i.variant?.image || i.product.image}
                alt={i.product.name}
                width="60"
                height="60"
                style={{
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "1px solid #e5e7eb",
                }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{i.product.name}</p>
                {i.variant && (
                  <small style={{ color: "#6b7280" }}>
                    Biến thể: {i.variant.name}
                  </small>
                )}
                <br />
                <small style={{ color: "#6b7280" }}>x {i.quantity}</small>
              </div>
            </div>

            <strong style={{ color: "#111827" }}>
              {(
                (i.variant?.price || i.product.price || 0) * i.quantity
              ).toLocaleString()}{" "}
              ₫
            </strong>
          </div>
        ))}

        <h3
          style={{
            textAlign: "right",
            marginTop: 20,
            color: "#111827",
          }}
        >
          Tổng cộng:{" "}
          <span style={{ color: "#dc2626" }}>{total.toLocaleString()} ₫</span>
        </h3>
      </div>

      {/* --- Form thông tin giao hàng --- */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            marginBottom: 15,
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: 8,
          }}
        >
          🚚 Thông tin người nhận
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <input
            name="name"
            placeholder="Họ tên người nhận"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <textarea
            name="address"
            placeholder="Địa chỉ giao hàng"
            value={form.address}
            onChange={handleChange}
            required
            style={{ ...inputStyle, height: 80, resize: "none" }}
          />

          <button
            type="submit"
            style={{
              marginTop: 10,
              padding: "12px 20px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 16,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#15803d")}
            onMouseOut={(e) => (e.target.style.background = "#16a34a")}
          >
            Xác nhận đặt hàng
          </button>
        </form>
      </div>
    </div>
  );
}
