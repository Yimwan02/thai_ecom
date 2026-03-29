import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState({});
  const navigate = useNavigate();

  const cancelOrder = (id) => {
    if(!window.confirm("คุณแน่ใจว่าต้องการยกเลิกคำสั่งซื้อนี้?")) return;
    
    fetch(`http://localhost:5000/api/orders/cancel/${id}`, { method: 'PUT' })
    .then(res => res.json())
    .then(() => {
      alert("ยกเลิกสำเร็จ");
      window.location.reload();
    });
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        data.forEach(item => {
          if (!grouped[item.order_id]) {
            grouped[item.order_id] = {
              total_price: item.total_price,
              status: item.status,
              items: []
            };
          }
          grouped[item.order_id].items.push(item);
        });
        setOrders(grouped);
      });
  }, []);

  return (
    <div className="container mt-5" style={{ paddingBottom: '40px' }}>
      {/* --- ส่วนที่เพิ่ม: หัวข้อพร้อมปุ่มย้อนกลับ --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">📦 ประวัติการสั่งซื้อของคุณ</h2>
        <button 
          className="btn btn-outline-secondary border-2 fw-bold shadow-sm"
          style={{ borderRadius: '10px' }}
          onClick={() => navigate('/user')}
        >
          ← กลับหน้าหลัก
        </button>
      </div>

      {Object.keys(orders).length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <p className="text-muted mb-0">ยังไม่มีประวัติการสั่งซื้อ</p>
        </div>
      ) : (
        Object.keys(orders).reverse().map(orderId => { 
          const order = orders[orderId];
          return (
            <div key={orderId} className="card mb-4 shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className="card-header bg-navy text-white d-flex justify-content-between align-items-center py-3">
                <span className="fw-bold">Order #{orderId}</span>
                {/* ปรับสี Badge ตามสถานะให้เหมือนในรูป */}
                <span className={`badge ${
                  order.status === 'pending' ? 'bg-warning text-dark' : 
                  order.status === 'cancelled' ? 'bg-danger' : 'bg-success'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="card-body p-4">
                {order.items.map((item, i) => (
                  <div key={i} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img
                      src={`http://localhost:5000/images/${item.product_img}`}
                      width="80"
                      height="80"
                      className="rounded shadow-sm me-3"
                      style={{ objectFit: 'contain', backgroundColor: '#fff' }}
                      alt={item.product_name}
                    />
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-bold">{item.product_name}</p>
                      <small className="text-muted">จำนวน {item.quantity} ชิ้น</small>
                      <p className="mb-0 text-primary fw-bold">฿{Number(item.subtotal).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h5 className="fw-bold mb-0">ยอดรวมทั้งหมด: <span className="text-navy">฿{Number(order.total_price).toLocaleString()}</span></h5>
                  
                  {order.status === "pending" && (
                    <button 
                      className="btn btn-danger btn-sm px-3 fw-bold shadow-sm" 
                      style={{ borderRadius: '8px' }}
                      onClick={() => cancelOrder(orderId)}
                    >
                      ยกเลิกคำสั่งซื้อ
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {/* ปุ่มล่างสุดเผื่อรายการยาว */}
      <button 
        className="btn btn-navy text-white w-100 mt-4 py-2 fw-bold shadow" 
        style={{ borderRadius: '10px' }}
        onClick={() => navigate('/user')}
      >
        กลับสู่หน้าหลัก
      </button>
    </div>
  );
}

export default Orders;