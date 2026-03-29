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
  const [sizes, setSizes] = useState([]);

  // =========================
  // ส่วนที่เพิ่มใหม่สำหรับฟอร์มสินค้า
  // =========================
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [productName, setProductName] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [productSizeId, setProductSizeId] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [keepOldImage, setKeepOldImage] = useState(true);

  useEffect(() => {
    if (!user || user.role_id !== 1) {
      window.location.href = "/";
      return;
    }
    fetchUsers();
    fetchTypeCounts();
    fetchProducts();
    fetchChart();
    fetchSizes();
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

  const fetchSizes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sizes");
      setSizes(res.data);
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
      setNewUsername("");
      setNewPassword("");
      fetchUsers();
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

  const chartDataConfig = {
    labels: chartData.map(d => monthNames[d.month]),
    datasets: [{
      label: "จำนวนผู้ใช้",
      data: chartData.map(d => d.total),
      backgroundColor: "rgba(54, 162, 235, 0.6)"
    }]
  };

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
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  // =========================
  // ฟังก์ชันฝั่งสินค้า
  // =========================

  // ล้างค่าฟอร์มสินค้า
  const resetProductForm = () => {
    setEditingProductId(null);
    setProductName("");
    setProductTypeId("");
    setProductSizeId("");
    setProductPrice("");
    setProductImage(null);
    setPreviewImage("");
    setKeepOldImage(true);
    setShowProductForm(false);

    const fileInput = document.getElementById("product_img");
    if (fileInput) fileInput.value = "";
  };

  // เปิดฟอร์มเพิ่มสินค้าใหม่
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductName("");
    setProductTypeId("");
    setProductSizeId("");
    setProductPrice("");
    setProductImage(null);
    setPreviewImage("");
    setKeepOldImage(true);
    setShowProductForm(true);

    const fileInput = document.getElementById("product_img");
    if (fileInput) fileInput.value = "";
  };

  // ตอนเลือกไฟล์รูปจากเครื่อง
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductImage(file);

    // แสดง preview รูปทันที
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage("");
    }
  };

  // กดแก้ไขสินค้า
  const handleEditProduct = (product) => {
    setEditingProductId(product.product_id);
    setProductName(product.product_name || "");
    setProductTypeId(String(product.product_type_id || ""));
    setProductSizeId(String(product.product_size_id || ""));
    setProductPrice(String(product.price || ""));
    setProductImage(null);
    setKeepOldImage(true);
    setShowProductForm(true);

    // ถ้ามีรูปเดิม ให้โชว์รูปเดิมก่อน
    if (product.product_img) {
      setPreviewImage(`http://localhost:5000/images/${product.product_img}`);
    } else {
      setPreviewImage("");
    }

    const fileInput = document.getElementById("product_img");
    if (fileInput) fileInput.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // บันทึกเพิ่มสินค้า / แก้ไขสินค้า
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!productName || !productTypeId || !productSizeId || !productPrice) {
      return alert("กรอกข้อมูลสินค้าให้ครบ");
    }

    try {
      const formData = new FormData();
      formData.append("product_name", productName);
      formData.append("product_type_id", productTypeId);
      formData.append("product_size_id", productSizeId);
      formData.append("price", productPrice);
      formData.append("keep_old_image", keepOldImage ? "true" : "false");

      // ถ้ามีไฟล์รูป ให้แนบไปด้วย
      if (productImage) {
        formData.append("product_img", productImage);
      }

      if (editingProductId) {
        await axios.put(`http://localhost:5000/api/products/update/${editingProductId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("แก้ไขสินค้าสำเร็จ");
      } else {
        await axios.post("http://localhost:5000/api/products/add", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("เพิ่มสินค้าสำเร็จ");
      }

      resetProductForm();
      fetchProducts();
      fetchTypeCounts();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "บันทึกสินค้าไม่สำเร็จ");
    }
  };

  // ลบสินค้า
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
      alert("ลบสินค้าสำเร็จ");
      fetchProducts();
      fetchTypeCounts();

      if (editingProductId === id) {
        resetProductForm();
      }
    } catch (err) {
      console.error(err);
      alert("ลบสินค้าไม่สำเร็จ");
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
                <div className="col-md-4">
                  <input className="form-control" placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
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

        {/* ================= หน้าจัดการสินค้า ================= */}
        {page === "products" && (
          <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>📦 รายการสินค้าทั้งหมด</h4>

              {!showProductForm ? (
                <button className="btn btn-success" onClick={handleOpenAddProduct}>
                  + เพิ่มสินค้าใหม่
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={resetProductForm}>
                  ปิดฟอร์ม
                </button>
              )}
            </div>

            {/* ฟอร์มจะยังไม่โชว์ จนกว่าจะกดปุ่มเพิ่มสินค้า หรือกดแก้ไข */}
            {showProductForm && (
              <div className="card p-4 shadow-sm border-0 mb-4">
                <h5 className="mb-3">
                  {editingProductId ? `แก้ไขสินค้า ID: ${editingProductId}` : "เพิ่มสินค้าใหม่"}
                </h5>

                <form onSubmit={handleSubmitProduct}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">ชื่อสินค้า</label>
                      <input
                        type="text"
                        className="form-control"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">ประเภทสินค้า</label>
                      <select
                        className="form-select"
                        value={productTypeId}
                        onChange={(e) => setProductTypeId(e.target.value)}
                      >
                        <option value="">-- เลือกประเภทสินค้า --</option>
                        {typeCounts.map((type) => (
                          <option key={type.product_type_id} value={type.product_type_id}>
                            {type.product_type_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">ขนาดสินค้า</label>
                      <select
                        className="form-select"
                        value={productSizeId}
                        onChange={(e) => setProductSizeId(e.target.value)}
                      >
                        <option value="">-- เลือกขนาดสินค้า --</option>
                        {sizes.map((size) => (
                          <option key={size.product_size_id} value={size.product_size_id}>
                            {size.product_size_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">ราคา</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">อัปโหลดรูปสินค้า</label>
                      <input
                        id="product_img"
                        type="file"
                        className="form-control"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageChange}
                      />
                      <div className="form-text">รองรับไฟล์ jpg, jpeg, png, webp ขนาดไม่เกิน 5MB</div>
                    </div>

                    {editingProductId && (
                      <div className="col-md-12">
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="keepOldImage"
                            checked={keepOldImage}
                            onChange={(e) => setKeepOldImage(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="keepOldImage">
                            เก็บรูปเดิมไว้ ถ้ายังไม่ได้เลือกรูปใหม่
                          </label>
                        </div>
                      </div>
                    )}

                    {previewImage && (
                      <div className="col-md-12">
                        <div className="border rounded p-3 bg-white text-center">
                          <div className="mb-2 fw-bold">ตัวอย่างรูปสินค้า</div>
                          <img
                            src={previewImage}
                            alt="preview"
                            style={{ maxWidth: "220px", maxHeight: "220px", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 d-flex gap-2">
                    <button type="submit" className={`btn ${editingProductId ? "btn-warning" : "btn-success"}`}>
                      {editingProductId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
                    </button>

                    <button type="button" className="btn btn-secondary" onClick={resetProductForm}>
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map((p) => (
                <div className="col" key={p.product_id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="text-center p-3" style={{ background: '#f8f9fa', height: '200px' }}>
                      <img
                        src={p.product_img ? `http://localhost:5000/images/${p.product_img}` : "https://placehold.co/150?text=No+Image"}
                        className="img-fluid h-100"
                        alt={p.product_name}
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = "https://placehold.co/150?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="card-body">
                      <h6 className="card-title fw-bold">{p.product_name}</h6>
                      <div className="small text-muted mb-2">ประเภท: {p.product_type_name || "-"}</div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="badge bg-info text-dark">ไซส์: {p.product_size_name || 'ทั่วไป'}</span>
                        <span className="text-danger fw-bold">฿{Number(p.price || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="card-footer bg-white border-0 d-flex gap-2 pb-3">
                      <button className="btn btn-outline-warning btn-sm w-100" onClick={() => handleEditProduct(p)}>
                        แก้ไข
                      </button>
                      <button className="btn btn-outline-danger btn-sm w-100" onClick={() => handleDeleteProduct(p.product_id)}>
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* สรุปประเภทสินค้า */}
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