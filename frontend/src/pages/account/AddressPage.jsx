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
<h2>Địa chỉ giao hàng</h2>


{addresses.map((a) => (
<div key={a._id} style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6, marginBottom: 10 }}>
<p><strong>{a.fullName}</strong> - {a.phone}</p>
<p>{a.street}, {a.ward}, {a.city}</p>
{a.isDefault && <span>(Mặc định)</span>}
<br />
<button onClick={() => remove(a._id)} className="btnRed">Xoá</button>
</div>
))}


<button className="btn" onClick={() => setAdding(true)}>+ Thêm địa chỉ mới</button>


{adding && <AddAddressForm onAdded={load} onClose={() => setAdding(false)} />}
</div>
);
}