import { useEffect, useState, useContext } from "react"; // ✅ เพิ่ม useContext
import axios from "axios";
import { Link } from 'react-router-dom';
import { CartContext } from "../context/CartContext"; // ✅ นำเข้า Context ของตะกร้า

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);

  // ✅ ดึงฟังก์ชัน addToCart มาใช้งานในหน้านี้
  const { addToCart } = useContext(CartContext);

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
      console.error("Error fetching products:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="shop-container">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-navy p-3 shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <img src="/logo-changsuek.png" alt="Logo" style={{ height: '50px' }} />
          <div className="search-box w-50">
            <input type="text" className="form-control" placeholder="ค้นหาสินค้า..." />
          </div>
          <div className="icons text-white d-flex align-items-center">
            {/* ✅ เพิ่ม Link ไปหน้าตะกร้าที่ไอคอนรถเข็น */}
            <Link to="/cart" className="text-decoration-none text-white me-3">
              <span style={{ fontSize: '1.5rem' }}>🛒</span>
            </Link>
            <span className="ms-2" onClick={handleLogout} style={{ cursor: 'pointer' }}>🚪 Logout</span>
          </div>
        </div>
      </nav>

      {/* Category Bar */}
      <div className="bg-gold text-center p-2 shadow-sm">
        <button className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อแข่ง</button>
        <button className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อซ้อม</button>
        <button className="btn btn-link text-dark fw-bold text-decoration-none mx-2">เสื้อวอร์ม</button>
      </div>

      {/* Banner */}
      <div className="hero-banner mb-5">
        <img src="/banner-team.jpg" className="img-fluid w-100" alt="Banner" style={{ maxHeight: '400px', objectFit: 'cover' }} />
      </div>

      {/* รายการสินค้า */}
      <div className="container">
        <h3 className="mb-4 text-navy fw-bold border-start border-4 border-primary ps-3">สินค้าแนะนำ</h3>
        <div className="row">
          {products.map((p) => (
            <div className="col-md-3 mb-4" key={p.product_id}>
              <div className="card h-100 shadow-sm border-0 product-card">

                {/* คลิกที่รูปเพื่อไปหน้าละเอียด */}
                <Link to={`/product/${p.product_id}`}>
                  <div className="text-center p-3">
                    <img
                      src={`http://localhost:5000/images/${p.product_img}`}
                      className="img-fluid"
                      alt={p.product_name}
                      style={{ cursor: 'pointer', objectFit: 'contain', height: '220px' }}
                      onError={(e) => e.target.src = "https://placehold.co/200x250?text=No+Image"}
                    />
                  </div>
                </Link>

                <div className="card-body text-center">
                  <h6 className="fw-bold text-dark text-truncate">{p.product_name}</h6>
                  <p className="text-danger fw-bold fs-5">฿{Number(p.price).toLocaleString()}</p>

                  <div className="d-grid gap-2 mt-3">
                    {/* ปุ่มดูรายละเอียด */}
                    <Link to={`/product/${p.product_id}`} className="btn btn-outline-navy btn-sm">
                      แสดงรายละเอียด
                    </Link>

                    {/* ✅ ปุ่มซื้อเลย: ส่งข้อมูลครบชุดเข้าตะกร้า */}
                    <button
                      className="btn btn-navy text-white btn-sm fw-bold"
                      onClick={() => {
                        addToCart({
                          product_id: p.product_id,
                          product_name: p.product_name,
                          price: p.price,
                          product_img: p.product_img, // ✅ ส่งชื่อรูปไป
                          size: 'S' // ค่าเริ่มต้น
                        });
                        alert("เพิ่มลงตะกร้าแล้ว!");
                      }}
                    >
                      ซื้อเลย
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;