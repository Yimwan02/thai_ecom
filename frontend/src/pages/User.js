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
      
      {/* 1. Navbar */}
      <nav style={{ backgroundColor: "#000033", padding: "10px 0", color: "white" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* แก้ชื่อไฟล์โลโก้ให้ตรงกับที่คุณมีในเครื่อง */}
            <img src="/logo-thailand.jpg" alt="Logo" style={{ height: "50px", marginRight: "15px" }} />
            <h3 style={{ fontFamily: 'serif', margin: 0 }}>Changsuek Shop</h3>
          </div>
          <div className="d-flex align-items-center">
            <Link to="/cart" style={{ textDecoration: "none", color: "white" }}>
            <div className="fs-4 me-3" style={{ cursor: "pointer" }}>
              🛒
            </div>
          </Link>
            <span className="me-3 d-none d-sm-inline">👤 <b>{user?.username}</b></span>
            
            <button onClick={handleLogout} className="btn btn-danger btn-sm rounded-pill px-3">
              Logout 🚪
            </button>
          </div>
        </div>
      </nav>


      {/* 2. Category Bar (แบบปรับปรุงใหม่) */}
<div className="category-container shadow-sm">
  <div className="container d-flex justify-content-center flex-wrap">
    <button 
      onClick={() => setSelectedCategory(null)} 
      className={`category-pill ${!selectedCategory ? 'active' : ''}`}
    >
      ทั้งหมด
    </button>
    
    <button 
      onClick={() => setSelectedCategory(1)} 
      className={`category-pill ${selectedCategory === 1 ? 'active' : ''}`}
    >
      เสื้อแข่ง
    </button>
    
    <button 
      onClick={() => setSelectedCategory(2)} 
      className={`category-pill ${selectedCategory === 2 ? 'active' : ''}`}
    >
      เสื้อซ้อม
    </button>
    
    <button 
      onClick={() => setSelectedCategory(3)} 
      className={`category-pill ${selectedCategory === 3 ? 'active' : ''}`}
    >
      เสื้อแข่ง Home
    </button>
    
    <button 
      onClick={() => setSelectedCategory(4)} 
      className={`category-pill ${selectedCategory === 4 ? 'active' : ''}`}
    >
      เสื้อแข่ง Away
    </button>
  </div>
</div>

      {/* 3. Hero Banner */}
      <div className="position-relative mb-5 shadow-lg">
        <img src="/banner-team.jpg" className="w-100" style={{ height: "450px", objectFit: "cover" }} alt="Banner"
         />
      </div>

      {/* 4. Product List */}
      <div className="container pb-5">
        <h4 className="mb-4 border-start border-4 border-warning ps-3" style={{ color: "#c5a358" }}>
          {selectedCategory ? "หมวดหมู่ที่เลือก" : "สินค้าแนะนำสำหรับคุณ"}
        </h4>
        
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredProducts.map((p) => (
            <div className="col" key={p.product_id}>
              {/* ใส่ Class 'product-card' เพื่อให้เด้งตาม CSS ที่เขียนไว้ */}
              <div className="card h-100 product-card">
                
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
      {/* ส่วนที่ 1: เกี่ยวกับเรา */}
      <div className="col-md-4">
        <h5 className="fw-bold mb-4" style={{ color: "#c5a358" }}>CHANGSUEK SHOP</h5>
        <p className="small text-secondary">
          ร้านค้าจำหน่ายสินค้าลิขสิทธิ์แท้จากทีมชาติไทย 
          เพื่อแฟนบอลช้างศึกทุกคน ร่วมสนับสนุนฟุตบอลไทยไปกับเรา
        </p>
        <div className="mt-4">
          <span className="me-3 fs-4" style={{ cursor: 'pointer' }}>🔴</span>
          <span className="me-3 fs-4" style={{ cursor: 'pointer' }}>⚪️</span>
          <span className="me-3 fs-4" style={{ cursor: 'pointer' }}>🔵</span>
          <span className="me-3 fs-4" style={{ cursor: 'pointer' }}>⚪️</span>
          <span className="me-3 fs-4" style={{ cursor: 'pointer' }}>🔴</span>
        </div>
      </div>

      {/* ส่วนที่ 2: เมนูช่วยเหลือ */}
      <div className="col-md-4 px-md-5">
        <h5 className="fw-bold mb-4" style={{ color: "#c5a358" }}>ช่วยเหลือ & ข้อมูล</h5>
        <ul className="list-unstyled small">
          <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary text-decoration-none">วิธีการสั่งซื้อ</span></li>
          <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary text-decoration-none">ช่องทางการชำระเงิน</span></li>
          <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary text-decoration-none">ตรวจสอบสถานะพัสดุ</span></li>
          <li className="mb-2"><span style={{ cursor: 'pointer' }} className="text-secondary text-decoration-none">นโยบายการเปลี่ยนคืนสินค้า</span></li>
        </ul>
      </div>

      {/* ส่วนที่ 3: ติดต่อเรา */}
      <div className="col-md-4">
        <h5 className="fw-bold mb-4" style={{ color: "#c5a358" }}>ติดต่อเรา</h5>
        <p className="small mb-2 text-secondary">📍 มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่</p>
        <p className="small mb-2 text-secondary">📞 โทร: 02-xxx-xxxx</p>
        <p className="small mb-2 text-secondary">📧 Email: support@changsuek.com</p>
        <p className="small mb-0 text-secondary">⏰ เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 18:00)</p>
      </div>
    </div>

    {/* แถบ Copyright ล่างสุด */}
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