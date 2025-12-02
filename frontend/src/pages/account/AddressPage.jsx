import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import AddAddressForm from "./AddAddressForm";

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const res = await api.get("/auth/profile");
    setAddresses(res.data.addresses || []);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await api.delete(`/auth/address/${id}`);
    toast.success("Đã xoá");
    load();
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 20, color: "#dc2626", fontWeight: 700 }}>
        Địa chỉ giao hàng
      </h2>

      {addresses.map((a) => (
        <div
          key={a._id}
          style={{
            padding: 16,
            border: "1px solid #fee2e2",
            borderRadius: 14,
            marginBottom: 12,
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p>
            <strong>{a.fullName}</strong> — {a.phone}
          </p>

          <p>
            {a.street}, {a.ward}, {a.city}
          </p>

          {a.isDefault && (
            <span style={{ color: "#dc2626", fontWeight: 600 }}>(Mặc định)</span>
          )}

          <br />

          <button
            onClick={() => remove(a._id)}
            style={{
              marginTop: 10,
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Xoá
          </button>
        </div>
      ))}

      <button
        className="btn"
        onClick={() => setAdding(true)}
        style={{
          background: "linear-gradient(135deg,#dc2626,#b91c1c)",
          color: "white",
          padding: "12px 20px",
          borderRadius: 14,
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 16,
        }}
      >
        + Thêm địa chỉ mới
      </button>

      {adding && (
        <AddAddressForm
          onAdded={load}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}
