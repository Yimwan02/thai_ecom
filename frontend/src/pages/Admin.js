import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState("users"); // 🔥 เพิ่มตัวนี้

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(2);

  useEffect(() => {
    if (!user || user.role_id !== 1) {
      window.location.href = "/";
    }

    fetchUsers();
  }, []);

  // 📥 โหลด users
  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/users");
    setUsers(res.data);
  };

  // ➕ เพิ่ม user
  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/users", {
        username: newUsername,
        password: newPassword,
        role_id: Number(newRole)
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

  // ❌ ลบ user
  const handleDelete = async (id) => {
    if (!window.confirm("ลบผู้ใช้?")) return;

    await axios.delete(`http://localhost:5000/api/users/${id}`);
    fetchUsers();
  };

  // 🔄 เปลี่ยน role
  const handleRoleChange = async (id, role_id) => {
    if (!window.confirm("เปลี่ยน role?")) return;

    await axios.put(`http://localhost:5000/api/users/${id}`, {
      role_id: Number(role_id)
    });

    fetchUsers();
  };

  // ================= UI =================
  return (
    <div className="bg-light min-vh-100">

      {/* 🔥 Navbar */}
      <AdminNavbar user={user} setPage={setPage} />

      <div className="container mt-4">

        {/* ================= USERS ================= */}
        {page === "users" && (
          <>
            <h4>📊 จัดการผู้ใช้</h4>

            <table className="table table-bordered mt-3">
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
                        className="form-select"
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
                        className="btn btn-danger"
                        onClick={() => handleDelete(u.user_id)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ➕ เพิ่ม user */}
            <div className="card p-3 mt-4">
              <h5>เพิ่มผู้ใช้</h5>

              <div className="row g-2">
                <div className="col">
                  <input
                    className="form-control"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>

                <div className="col">
                  <input
                    className="form-control"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="col">
                  <select
                    className="form-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                  </select>
                </div>

                <div className="col">
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
            <h4>🛍 จัดการสินค้า</h4>

            <div className="alert alert-info mt-3">
              🚧 หน้านี้คุณสามารถเพิ่มระบบสินค้าได้ เช่น:
              <ul>
                <li>เพิ่มสินค้า</li>
                <li>ลบสินค้า</li>
                <li>แก้ไขราคา</li>
              </ul>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Admin;