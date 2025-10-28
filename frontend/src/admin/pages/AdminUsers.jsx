import React, { useEffect, useState } from "react";
import adminUserService from "../services/adminUserService";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", address: "" });

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

  const startEdit = (u) => {
    setEditingId(u._id);
    setForm({ fullName: u.fullName || "", email: u.email || "", address: u.address || "" });
  };
  const cancelEdit = () => { setEditingId(null); setForm({ fullName: "", email: "", address: "" }); };

  const saveEdit = async () => {
    try {
      const { data } = await adminUserService.update(editingId, form);
      setUsers(users.map(u => u._id === editingId ? data.user : u));
      toast.success("Đã cập nhật người dùng");
      cancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật!");
    }
  };

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
      <h2 style={{ marginBottom: 20 }}>👥 Danh sách người dùng ({users.length})</h2>

      {users.length === 0 ? (
        <p>Chưa có người dùng nào.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={th}>Họ tên</th>
              <th style={th}>Email</th>
              <th style={th}>Địa chỉ</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
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
                    <input value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} />
                  ) : (u.address || "—")}
                </td>
                <td style={td}>
                  {u.isBanned ? <span style={{color:"#dc2626", fontWeight:600}}>Bị khóa</span> : <span style={{color:"#16a34a", fontWeight:600}}>Hoạt động</span>}
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: 10, border: "1px solid #e5e7eb", fontWeight: 600, textAlign: "left" };
const td = { padding: 10, border: "1px solid #e5e7eb", fontSize: 14 };

const btnPrimary = { background:"#2563eb", color:"white", border:"none", padding:"6px 12px", borderRadius:6, cursor:"pointer", marginRight:8 };
const btnDanger  = { background:"#dc2626", color:"white", border:"none", padding:"6px 12px", borderRadius:6, cursor:"pointer" };
const btnSuccess = { background:"#16a34a", color:"white", border:"none", padding:"6px 12px", borderRadius:6, cursor:"pointer" };
const btnGhost   = { background:"transparent", color:"#111827", border:"1px solid #e5e7eb", padding:"6px 12px", borderRadius:6, cursor:"pointer", marginLeft:8 };
