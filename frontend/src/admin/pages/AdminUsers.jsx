import React, { useEffect, useState } from "react";
import adminUserService from "../services/adminUserService";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");   // <- NEW

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    city: ""
  });

  const fetchUsers = async () => {
    try {
      const { data } = await adminUserService.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ================= FILTER USERS (SEARCH) =================
  const filteredUsers = users.filter(u => {
    const defaultAddr = u.addresses?.find(a => a.isDefault);
    const city = defaultAddr?.city || "";

    const keyword = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword) ||
      city.toLowerCase().includes(keyword)
    );
  });

  // ================= START EDIT =================
  const startEdit = (u) => {
    const defaultAddr = u.addresses?.find(a => a.isDefault);

    setEditingId(u._id);
    setForm({
      fullName: u.fullName || "",
      email: u.email || "",
      city: defaultAddr?.city || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ fullName: "", email: "", city: "" });
  };

  // ================= SAVE EDIT =================
  const saveEdit = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        city: form.city
      };

      const { data } = await adminUserService.update(editingId, payload);

      setUsers(users.map(u => u._id === editingId ? data.user : u));
      toast.success("Đã cập nhật người dùng");
      cancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật!");
    }
  };

  // ================= BAN / UNBAN =================
  const toggleBan = async (u) => {
    try {
      const api = u.isBanned ? adminUserService.unban : adminUserService.ban;
      const { data } = await api(u._id);

      setUsers(users.map(x => x._id === u._id ? data.user : x));
      toast.success(u.isBanned ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    } catch (err) {
      console.error(err);
      toast.error("Không thể thay đổi trạng thái!");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Đang tải...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>👥 Danh sách người dùng ({filteredUsers.length})</h2>

      {/* ================= SEARCH BAR ================= */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Tìm theo tên, email, thành phố..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 15
          }}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p>Không có người dùng phù hợp.</p>
      ) : (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={th}>Họ tên</th>
              <th style={th}>Email</th>
              <th style={th}>Tỉnh / Thành phố</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => {
              const defaultAddr = u.addresses?.find(a => a.isDefault);

              return (
                <tr key={u._id}>
                  <td style={td}>
                    {editingId === u._id ? (
                      <input value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} />
                    ) : u.fullName}
                  </td>

                  <td style={td}>
                    {editingId === u._id ? (
                      <input value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
                    ) : u.email}
                  </td>

                  <td style={td}>
                    {editingId === u._id ? (
                      <input
                        placeholder="Tỉnh / Thành phố"
                        value={form.city}
                        onChange={(e)=>setForm({...form, city:e.target.value})}
                      />
                    ) : (defaultAddr?.city || "—")}
                  </td>

                  <td style={td}>
                    {u.isBanned
                      ? <span style={{color:"#dc2626", fontWeight:600}}>Bị khóa</span>
                      : <span style={{color:"#16a34a", fontWeight:600}}>Hoạt động</span>
                    }
                  </td>

                  <td style={td}>
                    {editingId === u._id ? (
                      <>
                        <button onClick={saveEdit} style={btnPrimary}>Lưu</button>
                        <button onClick={cancelEdit} style={btnGhost}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} style={btnPrimary}>Sửa</button>
                        <button onClick={() => toggleBan(u)} style={u.isBanned ? btnSuccess : btnDanger}>
                          {u.isBanned ? "Mở khóa" : "Khóa"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  padding: 10,
  border: "1px solid #e5e7eb",
  fontWeight: 600
};

const td = {
  padding: 10,
  border: "1px solid #e5e7eb"
};

const btnPrimary = { background:"#2563eb", color:"white", border:"none", padding:"6px 12px", borderRadius:6 };
const btnDanger  = { background:"#dc2626", color:"white", border:"none", padding:"6px 12px", borderRadius:6 };
const btnSuccess = { background:"#16a34a", color:"white", border:"none", padding:"6px 12px", borderRadius:6 };
const btnGhost   = { background:"transparent", border:"1px solid #e5e7eb", padding:"6px 12px", borderRadius:6 };
