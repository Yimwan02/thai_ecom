import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import ProductType from "./ProductType";
import SizeManager from "../components/SizeManager";
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
import { use } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [page, setPage] = useState("users");

  // --- States ข้อมูล ---
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [typeCounts, setTypeCounts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizeCounts, setSizeCounts] = useState([]);
  const [salesSummary, setSalesSummary] = useState([]);
  const [chartData, setChartData] = useState([]);

  // --- States ฟอร์มผู้ใช้ใหม่ ---
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(2);

  // --- States ฟอร์มสินค้า --- เก็บข้อมูลจากฟอร์มสินค้าและควบคุมโหมดเพิ่ม/แก้ไขสินค้า
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); //เช็คว่าตอนนี้กำลังแก้ไขสินค้าหรือเพิ่มใหม่
  const [productName, setProductName] = useState(""); //ชื่อสินค้า
  const [productTypeId, setProductTypeId] = useState(""); //ประเภทสินค้า
  const [productSizeId, setProductSizeId] = useState(""); //ไซส์
  const [productPrice, setProductPrice] = useState(""); //ราคา
  const [productImage, setProductImage] = useState(null); //ไฟล์รูป
  const [previewImage, setPreviewImage] = useState(""); //รูปตัวอย่างก่อนบันทึก

  // ==========================================
  // 1. ฟังก์ชันดึงข้อมูล (Fetch) API หลายตัวพร้อมกันเพื่อโหลดข้อมูลสินค้า ไซส์ และรายงานยอดขายเข้าหน้าแอดมิน
  // หน้าที่โหลดข้อมูลที่เกี่ยวกับงานสินค้าแยกตามรายการ
  // ==========================================
  const fetchData = async () => {
    try {
      const [u, pt, p, s, ss, sc, chart] = await Promise.all([
        axios.get("http://localhost:5000/api/users"),
        axios.get("http://localhost:5000/api/product-types"), //ดึงรายการสินค้า
        axios.get("http://localhost:5000/api/products"), //
        axios.get("http://localhost:5000/api/sizes"), //ดึงไซส์
        axios.get("http://localhost:5000/api/products/sales-summary"), //ดึงรายงานยอดขายสินค้าแยกตามรายการ
        axios.get("http://localhost:5000/api/products/size-counts"), //ดึงสรุปจำนวนสินค้าแยกตามไซส์
        axios.get("http://localhost:5000/api/users/stats/monthly")
      ]);
      setUsers(u.data);
      setTypeCounts(pt.data);
      setProducts(p.data);
      setSizes(s.data);
      setSalesSummary(ss.data);
      setSizeCounts(sc.data);
      setChartData(chart.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (!user || user.role_id !== 1) {
      window.location.href = "/";
      return;
    }
    fetchData();
  }, []);

  // 2. จัดการผู้ใช้ (User Logic)

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return alert("กรอกข้อมูลให้ครบ");
    try {
      //  แก้ Path เป็น /api/users/add ให้ตรงกับ Server
      await axios.post("http://localhost:5000/api/users/add", {
        username: newUsername,
        password: newPassword,
        role_id: Number(newRole)
      });
      alert("เพิ่มผู้ใช้สำเร็จ ✨");
      setNewUsername("");
      setNewPassword("");
      fetchData(); // รีโหลดข้อมูลทั้งหมด
    } catch (err) {
      alert("เพิ่มไม่สำเร็จ: ชื่อผู้ใช้อาจซ้ำกัน");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("ยืนยันการลบผู้ใช้?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchData();
    } catch (err) { alert("user นี้มีการสั่งซื้อหรือมีประวัติในร้านค้า!!"); }
  };

  const handleRoleChange = async (id, role_id) => {
    if (!window.confirm("ยืนยันที่เปลี่ยนroleใช่มั้ย?")) return;
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, { role_id: Number(role_id) });
      fetchData();
    } catch (err) { alert("เปลี่ยน Role ไม่สำเร็จ"); }
  };

  // 3. จัดการสินค้า (Product Logic) ล้างค่าฟอร์มหลังบันทึกสำเร็จ หรือกดปิดฟอร์ม

  const resetProductForm = () => {
    setEditingProductId(null); setProductName(""); setProductTypeId("");
    setProductSizeId(""); setProductPrice(""); setProductImage(null);
    setPreviewImage(""); setShowProductForm(false);
  };
  // ฟังก์ชันหลักของฟอร์มสินค้า ทำงานตอนกดบันทึก และจะตรวจสอบก่อนว่ากรอกข้อมูลครบหรือยัง
  const handleSubmitProduct = async (e) => { //คือฟังก์ชันที่ทำงานตอนกด submit ฟอร์ม
    e.preventDefault(); //กันไม่ให้หน้า reload
    if (!productName || !productTypeId || !productSizeId || !productPrice) return alert("กรอกข้อมูลให้ครบ"); //ตรวจว่ากรอกข้อมูลครบไหม

    const formData = new FormData(); //มีการส่ง ไฟล์รูปสินค้า ไปพร้อมข้อมูลข้อความถ้าใช้ JSON ธรรมดาจะส่งไฟล์ไม่ได้
    //เอาค่าจากฟอร์มใส่ลงไป
    formData.append("product_name", productName);
    formData.append("product_type_id", productTypeId);
    formData.append("product_size_id", productSizeId);
    formData.append("price", productPrice);
    if (productImage) formData.append("product_img", productImage);

    //ส่งข้อมูลไป backend เพื่อ “เพิ่มสินค้า” หรือ “แก้ไขสินค้า”
    //ถ้ามี editingProductId แปลว่ากำลัง แก้ไขสินค้า
    //ถ้าไม่มี editingProductId แปลว่ากำลัง เพิ่มสินค้าใหม่
    try {
      if (editingProductId) {//ตัวแปร editingProductId เป็นตัวตัดสินว่า ตอนนี้กำลังเพิ่มสินค้าหรือแก้ไขสินค้า ถ้ามี id จะส่งไป endpoint update แต่ถ้าไม่มีจะส่งไป endpoint add
        await axios.put(`http://localhost:5000/api/products/update/${editingProductId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/products/add", formData);
      }
      //หลังบันทึกเสร็จ
      //1.แจ้งผล
      //2.ล้างฟอร์ม
      //3.โหลดข้อมูลสินค้าใหม่มาแสดง
      alert("บันทึกสินค้าสำเร็จ");
      resetProductForm();
      fetchData();
    } catch (err) { alert("บันทึกไม่สำเร็จ"); }
  }; 

  const handleDeleteProduct = async (id) => {
    // 1. ถามยืนยันก่อนลบ (เพื่อความปลอดภัย)
    if (!window.confirm("ยืนยันการลบสินค้าชิ้นนี้?")) return;

    try {
      // 2.ส่ง Request ไปที่ Backend
      // เช็ค URL ให้ตรงกับที่ Backend ตั้งไว้ (เช่น /api/products/delete/9)
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`);

      // 3.ถ้าลบสำเร็จ (Success)
      alert("ลบสินค้าเรียบร้อยแล้ว!");
      fetchData(); // โหลดรายการสินค้าใหม่มาแสดง

    } catch (err) {
      // 4.ส่วนดักจับ Error ไม่ให้หน้าจอแดง
      // เมื่อเกิด Error 500 (เช่น ติด Foreign Key ใน DB) มันจะวิ่งมาที่นี่ทันที

      console.error("Log ไว้ดูสาเหตุ:", err);

      // ดึงข้อความ Error มาโชว์เป็น Alert แทนหน้าจอแดงๆ
      const errorMsg = err.response?.data?.message || "ลบไม่สำเร็จ! สินค้านี้อาจถูกสั่งซื้อไปแล้ว หรือมีข้อมูลไซส์ผูกอยู่";

      alert("แจ้งเตือน: " + errorMsg);

      // **ห้ามเขียน throw err; ไว้ในนี้เด็ดขาด เพราะจะทำให้หน้าจอแดงเหมือนเดิม**
    }
  };

  // 4. ส่วนแสดงผล (UI)

  return (
    <div className="bg-light min-vh-100 pb-5">
      <AdminNavbar user={user} setPage={setPage} />
      <div className="container mt-4">

        {/* --- หน้าจัดการผู้ใช้ --- */}
        {page === "users" && (
          <div className="animate__animated animate__fadeIn">
            <h4 className="mb-3">👤 จัดการผู้ใช้</h4>
            <div className="table-responsive bg-white shadow-sm rounded">
              <table className="table table-hover text-center mb-0">
                <thead className="table-dark">
                  <tr><th>ID</th><th>Username</th><th>Role</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_id}</td>
                      <td>{u.username}</td>
                      <td>
                        <select className="form-select mx-auto" style={{ width: '120px' }}
                          value={u.role_id} onChange={(e) => handleRoleChange(u.user_id, e.target.value)}>
                          <option value="1">Admin</option>
                          <option value="2">User</option>
                        </select>
                      </td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.user_id)}>ลบ</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card p-3 mt-4 shadow-sm border-0">
              <h5>📊 จำนวนผู้ใช้รายเดือน</h5>
              <Bar
                data={{
                  labels: chartData.map(d => ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.month]),
                  datasets: [{ label: "ผู้ใช้ใหม่", data: chartData.map(d => d.total), backgroundColor: "#36a2eb" }]
                }}
                options={{ scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
              />
            </div>

            <div className="card p-4 mt-4 shadow-sm border-0 bg-white">
              <h5>➕ เพิ่มผู้ใช้ใหม่</h5>
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
          </div>
        )}

        {/* --- หน้าจัดการสินค้า --- */}
        {page === "products" && (
          <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>📦 รายการสินค้าทั้งหมด</h4>
              <button className={`btn ${showProductForm ? 'btn-secondary' : 'btn-success'}`} onClick={() => showProductForm ? resetProductForm() : setShowProductForm(true)}>
                {showProductForm ? "ปิดฟอร์ม" : "+ เพิ่มสินค้าใหม่"}
              </button>
            </div>

            {showProductForm && (
              <div className="card p-4 shadow-sm border-0 mb-4 bg-white">
                <h5 className="mb-3 text-primary">{editingProductId ? `แก้ไขสินค้า ID: ${editingProductId}` : "เพิ่มสินค้าใหม่"}</h5>
                <form onSubmit={handleSubmitProduct} className="row g-3">
                  <div className="col-md-6"><label className="form-label">ชื่อสินค้า</label><input type="text" className="form-control" value={productName} onChange={(e) => setProductName(e.target.value)} /></div> 
                  <div className="col-md-3"><label className="form-label">ประเภท</label>
                    <select className="form-select" value={productTypeId} onChange={(e) => setProductTypeId(e.target.value)}>
                      <option value="">-- เลือกประเภท --</option>
                      {typeCounts.map(t => <option key={t.product_type_id} value={t.product_type_id}>{t.product_type_name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3"><label className="form-label">ไซส์</label>
                    <select className="form-select" value={productSizeId} onChange={(e) => setProductSizeId(e.target.value)}>
                      <option value="">-- เลือกไซส์ --</option>
                      {sizes.map(s => <option key={s.product_size_id} value={s.product_size_id}>{s.product_size_name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4"><label className="form-label">ราคา</label><input type="number" className="form-control" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} /></div>
                  <div className="col-md-8"><label className="form-label">รูปภาพ</label><input type="file" className="form-control" onChange={(e) => { setProductImage(e.target.files[0]); setPreviewImage(URL.createObjectURL(e.target.files[0])); }} /></div>
                  {previewImage && <div className="col-12 text-center"><img src={previewImage} style={{ maxWidth: "120px" }} className="img-thumbnail" alt="preview" /></div>}
                  <div className="col-12"><button type="submit" className="btn btn-primary px-5">บันทึก</button></div>
                </form>
              </div>
            )}

            <div className="row row-cols-1 row-cols-md-4 g-4">
              {products.map((p) => (
                <div className="col" key={p.product_id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="p-3 bg-light text-center" style={{ height: '200px' }}><img src={p.product_img ? `http://localhost:5000/images/${p.product_img}` : "https://placehold.co/150"} className="img-fluid h-100" style={{ objectFit: 'contain' }} alt={p.product_name} /></div>
                    <div className="card-body">
                      <h6 className="fw-bold">{p.product_name}</h6>
                      <div className="small text-muted mb-2">{p.product_type_name} | {p.product_size_name}</div>
                      <div className="text-danger fw-bold">฿{Number(p.price).toLocaleString()}</div>
                    </div>
                    <div className="card-footer bg-white border-0 d-flex gap-2 pb-3">
                      <button className="btn btn-outline-warning btn-sm w-100" onClick={() => {
                        setEditingProductId(p.product_id);
                        setProductName(p.product_name);
                        setProductTypeId(String(p.product_type_id));
                        setProductSizeId(String(p.product_size_id));
                        setProductPrice(p.price);
                        setPreviewImage(p.product_img ? `http://localhost:5000/images/${p.product_img}` : "");
                        setShowProductForm(true);
                        window.scrollTo(0, 0);
                      }}>แก้ไข</button>
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => handleDeleteProduct(p.product_id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- หน้าประเภทสินค้า & สรุปไซส์ --- */}
        {page === "productTypes" && (
          <div className="animate__animated animate__fadeIn">
            <ProductType />
            <div className="card p-4 shadow-sm bg-white mt-4 border-0">
              <h5 className="text-primary mb-3">📊 สรุปจำนวนสินค้าแยกตามขนาด (Size)</h5>
              <table className="table table-bordered text-center">
                <thead className="table-primary"><tr><th>ขนาดสินค้า</th><th>จำนวนรายการ</th></tr></thead>
                <tbody>{sizeCounts.map((item, index) => (<tr key={index}><td className="fw-bold">{item.product_size_name}</td><td><span className="badge bg-info text-dark">{item.product_count} รายการ</span></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        {page === "sizes" && <SizeManager />}
        {page === "monthlyProductSales" && <MonthlySalesChart />}
      </div>
    </div>
  );
}

export default Admin;