import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function User() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
      return;
    }
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const scrollToProducts = () => {
    const element = document.getElementById("product-list-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.product_type_id === selectedCategory)
    : products;

  return (
    <div style={{ backgroundColor: "#000033", minHeight: "100vh" }}>

      {/* 1. Navbar (Sticky) */}
      <nav style={{
        backgroundColor: "#000022",
        padding: "10px 0",
        color: "white",
        borderBottom: "3px solid #c5a358",
        position: "sticky",
        top: 0,
        zIndex: 1100
      }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src="/logo-thailand.jpg" alt="Logo" style={{ height: "60px", marginRight: "15px" }} />
            <h3 style={{
              fontFamily: 'Arial Black, sans-serif',
              fontWeight: '900',
              letterSpacing: '1px',
              margin: 0,
              textTransform: 'uppercase',
              background: 'linear-gradient(to right, #ffffff, #c5a358)', // ไล่สีขาวไปทอง
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Changsuek Shop
            </h3>
          </div>
          <div className="d-flex align-items-center">
            <Link to="/orders" style={{ textDecoration: "none", color: "white" }}>
              <div className="fs-5 me-4" title="ประวัติการสั่งซื้อ" style={{ cursor: "pointer" }}>📜</div>
            </Link>
            <Link to="/cart" style={{ textDecoration: "none", color: "white" }}>
              <div className="fs-4 me-4" style={{ cursor: "pointer" }}>🛒</div>
            </Link>
            <span className="me-3 d-none d-sm-inline">👤 <b>{user?.username}</b></span>
            <button onClick={handleLogout} className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm">
              Logout 🚪
            </button>
          </div>
        </div>
      </nav>

      {/* 2. & 3. ส่วน Banner และ Category Bar ที่ลอยทับกัน */}
      <div className="position-relative shadow-lg" style={{ height: "750px", overflow: "hidden" }}>

        {/* แถบ Category ดีไซน์แบบโปร่งแสง ลอยอยู่บนรูป Banner */}
        <div className="category-container" style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          backdropFilter: "blur(8px)",
          padding: "15px 0"
        }}>
          <div className="container d-flex justify-content-center flex-wrap">
            <button onClick={() => { setSelectedCategory(null); scrollToProducts(); }} className={`category-pill ${!selectedCategory ? 'active' : ''}`}>ทั้งหมด</button>
            <button onClick={() => { setSelectedCategory(1); scrollToProducts(); }} className={`category-pill ${selectedCategory === 1 ? 'active' : ''}`}>เสื้อแข่ง</button>
            <button onClick={() => { setSelectedCategory(2); scrollToProducts(); }} className={`category-pill ${selectedCategory === 2 ? 'active' : ''}`}>เสื้อซ้อม</button>
            <button onClick={() => { setSelectedCategory(3); scrollToProducts(); }} className={`category-pill ${selectedCategory === 3 ? 'active' : ''}`}>เสื้อแข่ง Home</button>
            <button onClick={() => { setSelectedCategory(4); scrollToProducts(); }} className={`category-pill ${selectedCategory === 4 ? 'active' : ''}`}>เสื้อแข่ง Away</button>
          </div>
        </div>

        {/* รูป Banner หลัก */}
        <img
          src="/banner-team.jpg"
          className="w-100 h-100"
          style={{ objectFit: "cover", objectPosition: "center" }}
          alt="Main Banner"
        />

        {/* Layer สีดำจางๆ ด้านล่างเพื่อให้ข้อความใน Section ต่อไปเด่นขึ้น */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background: "linear-gradient(to bottom, transparent, #000033)"
        }}></div>
      </div>

      {/* 4. Product List */}
      <div id="product-list-section" className="container pb-5" style={{ marginTop: "50px" }}>
        <h4 className="mb-4 border-start border-4 border-warning ps-3" style={{ color: "#c5a358" }}>
          {selectedCategory ? "หมวดหมู่ที่เลือก" : "สินค้าแนะนำสำหรับคุณ"}
        </h4>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredProducts.map((p) => (
            <div className="col" key={p.product_id}>
              <div className="card h-100 product-card shadow-sm border-0">
                <Link to={`/product/${p.product_id}`}>
                  <img
                    src={`http://localhost:5000/images/${p.product_img}`}
                    className="card-img-top p-3"
                    style={{ height: "220px", objectFit: "contain" }}
                    onError={(e) => e.target.src = "https://placehold.co/200?text=No+Image"}
                    alt={p.product_name}
                  />
                </Link>

                <div className="card-body text-center d-flex flex-column">
                  <h6 className="fw-bold text-truncate" style={{ color: "#000" }}>{p.product_name}</h6>
                  <p className="text-danger fw-bold fs-5 mb-3">฿{Number(p.price).toLocaleString()}</p>

                  <div className="mt-auto">
                    <Link to={`/product/${p.product_id}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-outline-navy w-100 fw-bold">
                        แสดงรายละเอียดเพิ่มเติม
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 5. Footer (ส่วนล่างสุดของเว็บ) --- */}
      <footer style={{ backgroundColor: "#000022", color: "white", paddingTop: "50px", borderTop: "3px solid #c5a358" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold mb-4" style={{ color: "#c5a358" }}>CHANGSUEK SHOP</h5>
              <p className="small text-secondary">
                ร้านค้าจำหน่ายสินค้าลิขสิทธิ์แท้จากทีมชาติไทย
                เพื่อแฟนบอลช้างศึกทุกคน ร่วมสนับสนุนฟุตบอลไทยไปกับเรา
              </p>
              <div className="mt-4">
                <span className="me-2 fs-4">🔴</span>
                <span className="me-2 fs-4">⚪️</span>
                <span className="me-2 fs-4">🔵</span>
                <span className="me-2 fs-4">⚪️</span>
                <span className="me-2 fs-4">🔴</span>
              </div>
            </div>
            <div className="col-md-4 px-md-5">
              <h5 className="fw-bold mb-4" style={{ color: "#c5a358" }}>ช่วยเหลือ & ข้อมูล</h5>
              <ul className="list-unstyled small">
                <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary">วิธีการสั่งซื้อ</span></li>
                <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary">ช่องทางการชำระเงิน</span></li>
                <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary">ตรวจสอบสถานะพัสดุ</span></li>
                <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary">นโยบายคืนสินค้า</span></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold mb-4" style={{ color: "#c5a358" }}>ติดต่อเรา</h5>
              <p className="small mb-2 text-secondary">📍 มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่</p>
              <p className="small mb-2 text-secondary">📞 โทร: 02-xxx-xxxx</p>
              <p className="small mb-2 text-secondary">📧 Email: support@changsuek.com</p>
              <p className="small mb-0 text-secondary">⏰ เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 18:00)</p>
            </div>
          </div>
          <div className="text-center mt-5 py-3 border-top border-secondary">
            <p className="small mb-0 text-secondary">
              © 2026 <b>Changsuek Shop</b>. All Rights Reserved. พัฒนาโดย ทีมงาน Thai-Ecom
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default User;