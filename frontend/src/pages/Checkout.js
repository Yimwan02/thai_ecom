import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("cod");
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (cart.length === 0) { alert("ไม่มีสินค้าในตะกร้า"); return; }
    if (!address) { alert("กรอกที่อยู่จัดส่งด้วยครับ Artty"); return; }

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData ? userData.user_id : null;

    try {
      // ✅ ลบ URL เดิมออกแล้วใช้ตัวนี้ครับ (เน้นว่าต้องไม่มี :1 หรือตัวแปรต่อท้าย)
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          cartItems: cart,          
          total_amount: totalPrice, 
          address: address,
          payment_method: payment,  
        }),
      });

      // เช็คว่า Response ที่ส่งกลับมาเป็น JSON จริงไหม
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          alert("สั่งซื้อสำเร็จ 🎉 ของกำลังไปส่งครับ!");
          clearCart();
          navigate("/orders");
        } else {
          alert("เกิดข้อผิดพลาด: " + (data.message || "กรุณาลองใหม่"));
        }
      } else {
        // ถ้าไม่ใช่ JSON แสดงว่า URL ผิดจน Server ส่งหน้า Error HTML มา
        alert("Server หาทางไปไม่เจอ (404) ลอง Restart Backend ดูครับ");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("เชื่อมต่อ Server ไม่ได้ครับ Artty");
    }
  };

  return (
    <div className="cart-page-bg" style={{ minHeight: '100vh', padding: '40px 0' }}>
      <div className="container">
        <div className="checkout-card shadow-lg mx-auto" style={{ maxWidth: '900px', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="p-4 text-white text-center" style={{ backgroundColor: '#000033' }}>
            <h2 className="fw-bold mb-0">สรุปรายละเอียดการสั่งซื้อ</h2>
          </div>

          <div className="row g-0">
            {/* ฝั่งซ้าย: รายการสินค้า */}
            <div className="col-md-7 p-4 border-end">
              <h5 className="fw-bold mb-4 border-bottom pb-2">📦 รายการสินค้าของคุณ</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {cart.map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-3 p-2 rounded-3 bg-light">
                    <img
                      src={`http://localhost:5000/images/${item.product_img}`} 
                      alt={item.product_name}
                      width={80}
                      height={80}
                      className="me-3 rounded shadow-sm"
                      style={{ objectFit: 'contain', backgroundColor: '#fff' }}
                    />
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-bold text-navy" style={{ fontSize: '0.95rem' }}>{item.product_name}</p>
                      <small className="text-muted d-block">ไซส์: <span className="badge bg-secondary">{item.size}</span> | จำนวน: {item.quantity}</small>
                      <p className="mb-0 fw-bold text-primary">฿{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ฝั่งขวา: ที่อยู่และการชำระเงิน */}
            <div className="col-md-5 p-4 bg-light">
              <div className="mb-4">
                <h5 className="fw-bold mb-3">📍 ที่อยู่จัดส่ง</h5>
                <textarea 
                  className="form-control border-0 shadow-sm" 
                  rows="3" 
                  style={{ borderRadius: '10px' }}
                  placeholder="กรอกชื่อ-นามสกุล เบอร์โทร และที่อยู่จัดส่ง..."
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">💳 วิธีชำระเงิน</h5>
                <div className="payment-options d-grid gap-2">
                  <label className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center ${payment === 'cod' ? 'border-primary bg-white shadow-sm' : ''}`} style={{ cursor: 'pointer' }}>
                    <input type="radio" className="form-check-input me-3" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                    <span>ชำระเงินปลายทาง (COD)</span>
                  </label>
                  <label className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center ${payment === 'transfer' ? 'border-primary bg-white shadow-sm' : ''}`} style={{ cursor: 'pointer' }}>
                    <input type="radio" className="form-check-input me-3" checked={payment === "transfer"} onChange={() => setPayment("transfer")} />
                    <span>โอนเงินผ่านธนาคาร</span>
                  </label>
                </div>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="text-secondary fw-bold">ยอดชำระสุทธิ:</span>
                <span className="fs-3 fw-bold text-danger">฿{totalPrice.toLocaleString()}</span>
              </div>

              <div className="d-grid gap-2">
                <button 
                  onClick={handleOrder} 
                  className="btn btn-lg text-white fw-bold shadow-sm" 
                  style={{ backgroundColor: '#28a745', borderRadius: '12px', padding: '12px' }}
                >
                  ยืนยันคำสั่งซื้อ
                </button>
                <button 
                  className="btn btn-link text-decoration-none text-muted mt-2"
                  onClick={() => navigate('/cart')}
                >
                  ← กลับไปหน้าตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;