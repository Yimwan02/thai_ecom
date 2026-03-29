import { useEffect, useState ,useContext} from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { CartContext } from "../context/CartContext";

function User() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // <-- ตัวแปรที่หายไป
  const { addToCart, cart } = useContext(CartContext);

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

  // --- ส่วนคำนวณ Filter สินค้า (ตัวแปรที่หายไป) ---
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.product_type_id === selectedCategory)
    : products;

  return (
    <div style={{ backgroundColor: "#000033", minHeight: "100vh" }}>
      
      {/* 1. Navbar */}
      <nav style={{ backgroundColor: "#000033", padding: "10px 0", color: "white" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src="logo-thailand.png.jpg" alt="Logo" style={{ height: "50px", marginRight: "15px" }} />
            <h3 style={{ fontFamily: 'serif', margin: 0 }}>Changsuek Shop</h3>
          </div>
          <div className="w-50 mx-4 d-none d-md-block">
            <input type="text" className="form-control rounded-pill" placeholder="🔍 ค้นหาสินค้าที่ต้องการ..." />
          </div>
          <div className="d-flex align-items-center">
            <span className="me-3 d-none d-sm-inline">สวัสดี, <b>{user?.username}</b></span>
            
            
            
          <Link to="/cart" style={{ textDecoration: "none", color: "white" }}>
            <div className="fs-4 me-3" style={{ cursor: "pointer" }}>
              🛒 ตะกร้า
            </div>
          </Link>
            
            
            
            
            
            
            <button onClick={handleLogout} className="btn btn-danger btn-sm rounded-pill px-3">
              Logout 🚪
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Category Bar */}
      <div className="text-center py-2 shadow-sm" style={{ backgroundColor: "#c5a358" }}>
        <div className="container">
          <button onClick={() => setSelectedCategory(null)} className={`btn btn-link text-dark fw-bold text-decoration-none mx-2 ${!selectedCategory ? 'border-bottom border-2 border-dark' : ''}`}>ทั้งหมด</button>
          <button onClick={() => setSelectedCategory(1)} className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อแข่ง</button>
          <button onClick={() => setSelectedCategory(2)} className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อซ้อม</button>
          <button onClick={() => setSelectedCategory(3)} className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อแข่ง Home</button>
          <button onClick={() => setSelectedCategory(4)} className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อแข่ง Away</button>
        </div>
      </div>

      {/* 3. Hero Banner */}
      <div className="position-relative mb-5">
        <img src="/banner-team.jpg" className="w-100" style={{ height: "450px", objectFit: "cover" }} alt="Banner" />
      </div>

      {/* 4. Product List */}
      <div className="container pb-5" style={{ color : "#c5a358" }}>
        <h4 className="mb-4 border-start border-4 border-primary ps-3">
          {selectedCategory ? "หมวดหมู่ที่เลือก" : "สินค้าแนะนำสำหรับคุณ"}
        </h4>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredProducts.map((p) => (
            <div className="col" key={p.product_id}>
              <div className="card h-100 border-0 shadow-sm hover-shadow" style={{ transition: "0.3s" }}>
                
                {/* คลิกลิงก์ที่รูปภาพ */}
                <Link to={`/product/${p.product_id}`}>
                  <img 
                    src={`http://localhost:5000/images/${p.product_img}`} 
                    className="card-img-top p-3" 
                    style={{ height: "220px", objectFit: "contain", cursor: "pointer" }}
                    onError={(e) => e.target.src = "https://placehold.co/200?text=No+Image"}
                    alt={p.product_name}
                  />
                </Link>

                <div className="card-body text-center">
                  <h6 className="fw-bold text-truncate">{p.product_name}</h6>
                  <p className="text-danger fw-bold fs-5 mb-3">฿{Number(p.price).toLocaleString()}</p>
                  
                  {/* คลิกลิงก์ที่ปุ่ม */}
                  <Link to={`/product/${p.product_id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-navy w-100 text-white" style={{ backgroundColor: "#000033" }}>
                      แสดงรายละเอียดเพิ่มเติม
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default User;