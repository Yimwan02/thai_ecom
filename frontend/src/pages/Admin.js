import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import ProductType from "./ProductType"; // 1. Import หน้าของคุณเข้ามา

function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState("users");

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(2);

  useEffect(() => {
    // ตรวจสอบสิทธิ์ Admin
    if (!user || user.role_id !== 1) {
      window.location.href = "/";
      return; // หยุดการทำงานถ้าไม่ใช่ admin
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/users", {
        username: newUsername,
        password: newPassword,
        role_id: Number(newRole),
      });
      alert("เพิ่มผู้ใช้สำเร็จ");
      setNewUsername("");
      setNewPassword("");
      setNewRole(2);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("เพิ่มไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ลบผู้ใช้?")) return;
    try {
      // แก้ไข: ใช้ backticks (`) แทนฟันหนูธรรมดาเพื่อให้ ${id} ทำงาน
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleRoleChange = async (id, role_id) => {
    if (!window.confirm("เปลี่ยน role?")) return;
    try {
      // แก้ไข: ใช้ backticks (`) แทนฟันหนูธรรมดา
      await axios.put(`http://localhost:5000/api/users/${id}`, {
        role_id: Number(role_id),
      });
      fetchUsers();
    } catch (err) {
      alert("เปลี่ยน Role ไม่สำเร็จ");
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <AdminNavbar user={user} setPage={setPage} />

      <div className="container mt-4">
        {/* ================= USERS ================= */}
        {page === "users" && (
          <>
            <h4> จัดการผู้ใช้</h4>
            <table className="table table-bordered mt-3 text-center align-middle shadow-sm bg-white">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.user_id}</td>
                    <td>{u.username}</td>
                    <td>
                      <select
                        className="form-select mx-auto"
                        style={{ width: "120px" }}
                        value={u.role_id}
                        onChange={(e) =>
                          handleRoleChange(u.user_id, e.target.value)
                        }
                      >
                        <option value="1">Admin</option>
                        <option value="2">User</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.user_id)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="card p-3 mt-4 shadow-sm">
              <h5>เพิ่มผู้ใช้ใหม่</h5>
              <div className="row g-2">
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-success w-100"
                    onClick={handleCreateUser}
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= PRODUCTS ================= */}
        {page === "products" && (
          <>
            <h4> จัดการสินค้า</h4>
            <div className="alert alert-info mt-3">
              ส่วนจัดการสินค้าของเพื่อนคุณ
            </div>
          </>
        )}

        {/* ================= PRODUCT TYPES (ส่วนของคุณ) ================= */}
        {page === "productTypes" && <ProductType />}
      </div>
    </div>
  );
}

export default Admin;