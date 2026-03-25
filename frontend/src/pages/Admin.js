import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import ProductType from "./ProductType";

function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [typeCounts, setTypeCounts] = useState([]);
  const [page, setPage] = useState("users");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(2);
  const [products, setProducts] = useState([]); 


  const fetchProducts = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  } catch (err) {
    console.error("Fetch products error:", err);
  }
};
  useEffect(() => {
  if (!user || user.role_id !== 1) {
    window.location.href = "/";
    return;
  }
  fetchUsers();
  fetchTypeCounts();
  fetchProducts(); // <-- เพิ่มบรรทัดนี้ครับ!
}, []);
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const fetchTypeCounts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/product-types");
      setTypeCounts(res.data);
    } catch (err) {
      console.error("Fetch type counts error:", err);
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
      alert("เพิ่มไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ลบผู้ใช้?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleRoleChange = async (id, role_id) => {
    if (!window.confirm("เปลี่ยน role?")) return;
    try {
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

        {/* ================= 1. หน้าจัดการผู้ใช้ ================= */}
        {page === "users" && (
          <>
            <h4 className="mb-3">👤 จัดการผู้ใช้</h4>
            <div className="table-responsive">
              <table className="table table-bordered text-center align-middle shadow-sm bg-white">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.user_id}>
                        <td>{u.user_id}</td>
                        <td>{u.username}</td>
                        <td>
                          <select
                            className="form-select mx-auto"
                            style={{ width: "120px" }}
                            value={u.role_id}
                            onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                          >
                            <option value="1">Admin</option>
                            <option value="2">User</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(u.user_id)}
                          >ลบ</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">กำลังโหลดข้อมูล หรือ ไม่พบผู้ใช้...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ส่วนเพิ่มผู้ใช้ */}
            <div className="card p-3 mt-4 shadow-sm border-0">
              <h5>เพิ่มผู้ใช้ใหม่</h5>
              <div className="row g-2">
                <div className="col-md-4">
                  <input className="form-control" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-success w-100" onClick={handleCreateUser}>เพิ่ม</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= 2. หน้าจัดการสินค้า ================= */}
        {page === "products" && (
          <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>📦 รายการสินค้าทั้งหมด</h4>
              <button className="btn btn-success">+ เพิ่มสินค้าใหม่</button>
            </div>

            {/* แสดงสินค้าในรูปแบบ Grid Card */}
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {products?.length > 0 ? (
                products.map((p) => (
                  <div className="col" key={p.product_id}>
                    <div className="card h-100 shadow-sm border-0">
                      {/* ส่วนรูปภาพสินค้า */}
                      <div className="text-center p-3" style={{ background: '#f8f9fa', borderRadius: '10px 10px 0 0' }}>
                        <img
                          src={p.product_img ? `http://localhost:5000/images/${p.product_img}` : "https://via.placeholder.com/150"}
                          className="img-fluid"
                          alt={p.product_name}
                          style={{ maxHeight: '180px', objectFit: 'contain' }}
                        />
                      </div>

                      <div className="card-body">
                        <h6 className="card-title fw-bold">{p.product_name}</h6>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="text-muted small">
                            <i className="bi bi-tag-fill me-1"></i> ไซส์: {p.product_size_id} {/* ควรดึงชื่อไซส์มาแสดงแทน ID */}
                          </span>
                          <span className="text-danger fw-bold fs-5">฿{p.product_price.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="card-footer bg-white border-0 d-flex gap-2 pb-3">
                        <button className="btn btn-outline-warning btn-sm w-100">แก้ไข</button>
                        <button className="btn btn-outline-danger btn-sm w-100">ลบ</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 w-100">
                  <div className="alert alert-light text-center shadow-sm">
                    ไม่พบข้อมูลสินค้า หรือยังไม่ได้เปิด Backend
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. หน้าประเภทสินค้า ================= */}
        {page === "productTypes" && (
          <>
            <ProductType />

            <div className="card p-4 shadow-sm bg-white mt-5 mb-5">
              <h4 className="text-primary mb-4">📊 สรุปจำนวนสินค้าแยกตามประเภท</h4>
              <div className="table-responsive">
                <table className="table table-hover table-bordered text-center">
                  <thead className="table-primary">
                    <tr>
                      <th>ชื่อประเภทสินค้า</th>
                      <th>จำนวนที่มีในระบบ (รายการ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeCounts?.length > 0 ? (
                      typeCounts.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{item.product_type_name}</td>
                          <td>
                            <span className="badge bg-info text-dark fs-6">
                              {item.product_count} รายการ
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-muted">ไม่พบข้อมูลสรุป</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Admin;