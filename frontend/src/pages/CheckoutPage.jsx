import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cartService from "../services/cartService";
import orderService from "../services/orderService";
import { toast } from "react-toastify";
import { SERVER_URL } from "../services/api";
import api from "../services/api";

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  // ===============================
  // Load CART
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
  // Load ADDRESS nếu đã login
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api.get("/auth/addresses")
      .then(res => {
        setAddresses(res.data);

        const defaultAddr = res.data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);

          const user = JSON.parse(localStorage.getItem("user") || "{}");

          setForm({
            name: defaultAddr.fullName,
            phone: defaultAddr.phone,
            email: user.email || "",
            address: `${defaultAddr.street}, ${defaultAddr.ward}, ${defaultAddr.city}`,
          });
        }
      })
      .catch(() => console.log("Không tải được địa chỉ"));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ===============================
  // Submit Order
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      await orderService.createOrder({ ...form, selectedItems });
      toast.success("Đặt hàng thành công!");
      navigate("/success");
    } catch {
      toast.error("Lỗi khi đặt hàng!");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Đang tải...</p>;

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
  };

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>🧾 Thanh toán</h1>

      {/* CHỌN ĐỊA CHỈ */}
      {addresses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3>📍 Chọn địa chỉ giao hàng</h3>
          {addresses.map(addr => (
            <label key={addr._id} style={{ display: "block", marginBottom: 10 }}>
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
              <strong>{addr.fullName}</strong> - {addr.phone}<br />
              {addr.street}, {addr.ward}, {addr.city}
              {addr.isDefault && <strong style={{ color: "#16a34a" }}> Mặc định</strong>}
            </span>

            </label>
          ))}
        </div>
      )}

      {/* DANH SÁCH SẢN PHẨM ĐANG ĐẶT */}
      <div style={{ marginBottom: 30 }}>
        <h3>🛒 Sản phẩm đã chọn</h3>

        {cart.items
          .filter(item => selectedItems.includes(item._id))
          .map(item => {
            const product = item.product;
            const price = item.variant?.price || product.price;

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
                  borderRadius: 8
                }}
              >
                <img
                  src={`${SERVER_URL}/${product.image}`}
                  alt={product.name}
                  style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }}
                />

                <div style={{ flex: 1 }}>
                  <strong>{product.name}</strong>
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


      {/* FORM NHẬP */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
          }}
        >
          Xác nhận đặt hàng
        </button>
      </form>

      <h3 style={{ marginTop: 20 }}>
        Tổng tiền: <span style={{ color: "#dc2626" }}>{total.toLocaleString()} ₫</span>
      </h3>
    </div>
  );
}
