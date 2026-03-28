import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);

  // 🔒 กันคนไม่ได้ login
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
      {/* --- ส่วนที่ 1: Navbar (แถบบนสุด) --- */}
      <nav className="navbar navbar-dark bg-navy p-3">
        <div className="container d-flex justify-content-between align-items-center">
          <img src="/logo-changsuek.png" alt="Logo" style={{ height: '50px' }} />
          <div className="search-box w-50">
             <input type="text" className="form-control" placeholder="ค้นหาสินค้า..." />
          </div>
          <div className="icons text-white">
             <span>🛒</span> <span className="ms-3" onClick={handleLogout} style={{cursor:'pointer'}}>🚪 Logout</span>
          </div>
        </div>
      </nav>

      {/* --- ส่วนที่ 2: Category Bar (แถบสีทอง) --- */}
      <div className="bg-gold text-center p-2">
        <button className="btn btn-link text-dark fw-bold">เสื้อแข่ง</button>
        <button className="btn btn-link text-dark fw-bold">เสื้อซ้อม</button>
        <button className="btn btn-link text-dark fw-bold">เสื้อวอร์ม</button>
      </div>

      {/* --- ส่วนที่ 3: Banner --- */}
      <div className="hero-banner">
         <img src="/banner-team.jpg" className="img-fluid w-100" alt="Banner" />
      </div>

      {/* --- ส่วนที่ 4: รายการสินค้า --- */}
      <div className="container mt-5">
        <h3 className="mb-4">สินค้าแนะนำ</h3>
        <div className="row">
          {products.map(p => (
            <div className="col-md-3 mb-4" key={p.product_id}>
              <div className="card h-100 shadow-sm border-0">
                <img src={`http://localhost:5000/images/${p.product_img}`} className="card-img-top p-3" />
                <div className="card-body text-center">
                  <h6 className="fw-bold">{p.product_name}</h6>
                  <p className="text-danger">฿{Number(p.price).toLocaleString()}</p>
                  <button className="btn btn-navy w-100 text-white">ซื้อเลย</button>
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