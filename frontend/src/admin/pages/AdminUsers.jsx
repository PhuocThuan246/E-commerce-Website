import React, { useEffect, useState } from "react";
import adminUserService from "../services/adminUserService";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await adminUserService.delete(id);
      toast.success("Đã xóa người dùng!");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa người dùng!");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Đang tải...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>👥 Danh sách người dùng ({users.length})</h2>

      {users.length === 0 ? (
        <p>Chưa có người dùng nào.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={th}>Họ tên</th>
              <th style={th}>Email</th>
              <th style={th}>Địa chỉ</th>
              <th style={th}>Vai trò</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={td}>{u.fullName}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.address || "—"}</td>
                <td style={td}>{u.role}</td>
                <td style={td}>
                  <button
                    onClick={() => handleDelete(u._id)}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
                    onMouseOut={(e) => (e.target.style.background = "#dc2626")}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  padding: 10,
  border: "1px solid #e5e7eb",
  fontWeight: 600,
  textAlign: "left",
};

const td = {
  padding: 10,
  border: "1px solid #e5e7eb",
  fontSize: 14,
};
