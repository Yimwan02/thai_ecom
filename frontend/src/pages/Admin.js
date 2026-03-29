import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import ProductType from "./ProductType";
import MonthlySalesChart from "../components/MonthlySalesChart";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [typeCounts, setTypeCounts] = useState([]);
  const [page, setPage] = useState("users");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(2);
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState([]);



  useEffect(() => {
    if (!user || user.role_id !== 1) {
      window.location.href = "/";
      return;
    }
    fetchUsers();
    fetchTypeCounts();
    fetchProducts();
    fetchChart();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTypeCounts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/product-types");
      setTypeCounts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return alert("กรอกข้อมูลให้ครบ");
    try {
      await axios.post("http://localhost:5000/api/users", {
        username: newUsername,
        password: newPassword,
        role_id: Number(newRole),
      });
      alert("เพิ่มสำเร็จ");
      setNewUsername(""); setNewPassword(""); fetchUsers();
    } catch (err) { alert("เพิ่มไม่สำเร็จ"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    } catch (err) { alert("ลบไม่สำเร็จ"); }
  };

  const handleRoleChange = async (id, role_id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, {
        role_id: Number(role_id),
      });
      fetchUsers();
    } catch (err) { alert("เปลี่ยน Role ไม่สำเร็จ"); }
  };

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartDataConfig = {labels: chartData.map(d => monthNames[d.month]),datasets: [{label: "จำนวนผู้ใช้",data: chartData.map(d => d.total),backgroundColor: "rgba(54, 162, 235, 0.6)"}]};

  const fetchChart = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/users/stats/monthly");
    setChartData(res.data);
  } catch (err) {
    console.log(err);
  }
};

  const options = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1, // 👈 บังคับทีละ 1
        precision: 0 // 👈 ไม่เอาทศนิยม
      }
    }
  }
};

  return (
    <div className="bg-light min-vh-100 pb-5">
      <AdminNavbar user={user} setPage={setPage} />
      <div className="container mt-4">

        {/* จัดการผู้ใช้ */}
        {page === "users" && (
          <>
            <h4 className="mb-3">👤 จัดการผู้ใช้</h4>
            <table className="table table-bordered bg-white shadow-sm text-center">
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
                        className="form-select mx-auto" style={{ width: '120px' }}
                        value={u.role_id}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                      >
                        <option value="1">Admin</option>
                        <option value="2">User</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.user_id)}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             <div className="card p-3 mt-4">
              <h5>📊 จำนวนผู้ใช้รายเดือน</h5>
              <Bar data={chartDataConfig} options={options} />
            </div>

            {/* ฟอร์มเพิ่มผู้ใช้ */}
            <div className="card p-3 shadow-sm border-0 mt-4">
              <h5>เพิ่มผู้ใช้ใหม่</h5>
              <div className="row g-2">
                <div className="col-md-4"><input className="form-control" placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} /></div>
                <div className="col-md-3"><input className="form-control" type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                <div className="col-md-3">
                  <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                  </select>
                </div>
                <div className="col-md-2"><button className="btn btn-success w-100" onClick={handleCreateUser}>เพิ่ม</button></div>
              </div>
            </div>
          </>
        )}
        {/* ================= 2. หน้าจัดการสินค้า (เอามาคืนให้แล้วครับ!) ================= */}
        {page === "products" && (
          <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>📦 รายการสินค้าทั้งหมด</h4>
              <button className="btn btn-success">+ เพิ่มสินค้าใหม่</button>
            </div>

            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map((p) => (
                <div className="col" key={p.product_id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="text-center p-3" style={{ background: '#f8f9fa', height: '200px' }}>
                      <img
                        src={`http://localhost:5000/images/${p.product_img}`}
                        className="img-fluid h-100"
                        alt={p.product_name}
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = "https://placehold.co/150?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="card-body">
                      <h6 className="card-title fw-bold text-truncate">{p.product_name}</h6>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="badge bg-info text-dark">ไซส์: {p.product_size_name || 'ทั่วไป'}</span>
                        <span className="text-danger fw-bold">฿{Number(p.price || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="card-footer bg-white border-0 d-flex gap-2 pb-3">
                      <button className="btn btn-outline-warning btn-sm w-100">แก้ไข</button>
                      <button className="btn btn-outline-danger btn-sm w-100">ลบ</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* สรุปประเภทสินค้า (ด้านล่างสุด) */}
        {page === "productTypes" && (
          <div className="mt-5">
            <ProductType />
            <div className="card p-4 shadow-sm bg-white mt-4">
              <h4 className="text-primary mb-4">📊 สรุปจำนวนสินค้าแยกตามประเภท</h4>
              <table className="table table-hover table-bordered text-center">
                <thead className="table-primary">
                  <tr>
                    <th>ชื่อประเภทสินค้า</th>
                    <th>จำนวนที่มีในระบบ</th>
                  </tr>
                </thead>
                <tbody>
                  {typeCounts.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{item.product_type_name}</td>
                      <td><span className="badge bg-info text-dark fs-6">{item.product_count} รายการ</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {page === "monthlyProductSales" && <MonthlySalesChart />}
      </div>
    </div>
  );
}

export default Admin;