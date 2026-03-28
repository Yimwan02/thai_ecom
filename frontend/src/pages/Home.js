import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);

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
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="shop-container">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-navy p-3">
        <div className="container d-flex justify-content-between align-items-center">
          <img src="/logo-changsuek.png" alt="Logo" style={{ height: '50px' }} />
          <div className="search-box w-50">
            <input type="text" className="form-control" placeholder="ค้นหาสินค้า..." />
          </div>
          <div className="icons text-white">
            <span>🛒</span> <span className="ms-3" onClick={handleLogout} style={{ cursor: 'pointer' }}>🚪 Logout</span>
          </div>
        </div>
      </nav>

      {/* Category Bar */}
      <div className="bg-gold text-center p-2">
        <button className="btn btn-link text-dark fw-bold">เสื้อแข่ง</button>
        <button className="btn btn-link text-dark fw-bold">เสื้อซ้อม</button>
        <button className="btn btn-link text-dark fw-bold">เสื้อวอร์ม</button>
      </div>

      {/* Banner */}
      <div className="hero-banner">
        <img src="/banner-team.jpg" className="img-fluid w-100" alt="Banner" />
      </div>

      {/* รายการสินค้า (ลบส่วนที่ซ้อนกันออกแล้ว) */}
      <div className="container mt-5">
        <h3 className="mb-4 text-navy fw-bold">สินค้าแนะนำ</h3>
        <div className="row">
          {products.map((p) => (
            <div className="col-md-3 mb-4" key={p.product_id}>
              <div className="card h-100 shadow-sm border-0">

                {/* คลิกที่รูปเพื่อไปหน้าละเอียด */}
                <Link to={`/product/${p.product_id}`}>
                  <img
                    src={`http://localhost:5000/images/${p.product_img}`}
                    className="card-img-top p-3"
                    alt={p.product_name}
                    style={{ cursor: 'pointer', objectFit: 'contain', height: '250px' }}
                  />
                </Link>

                <div className="card-body text-center">
                  <h6 className="fw-bold">{p.product_name}</h6>
                  <p className="text-danger fw-bold">฿{Number(p.price).toLocaleString()}</p>

                  <div className="d-grid gap-2">
                    {/* ปุ่มดูรายละเอียด */}
                    <Link to={`/product/${p.product_id}`} className="btn btn-outline-navy btn-sm">
                      แสดงรายละเอียด
                    </Link>

                    {/* ปุ่มซื้อเลย */}
                    <button className="btn btn-navy text-white btn-sm">
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