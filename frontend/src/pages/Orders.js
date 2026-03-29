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
    /* 1. เพิ่มสไตล์ที่ div นอกสุด เพื่อให้สีพื้นหลังคลุมทั้งหน้า */
    <div style={{ backgroundColor: "#000033", minHeight: "100vh", paddingBottom: "40px" }}>
      
      {/* 2. ครอบเนื้อหาด้วย container และปรับสีตัวแทนหัวข้อให้เด่นขึ้น */}
      <div className="container pt-5">
        
        <div className="d-flex justify-content-between align-items-center mb-4 text-white">
          <h2 className="fw-bold mb-0">📦 ประวัติการสั่งซื้อของคุณ</h2>
          <button 
            className="btn btn-outline-light border-2 fw-bold shadow-sm"
            style={{ borderRadius: '10px' }}
            onClick={() => navigate('/user')}
          >
            ← กลับหน้าหลัก
          </button>
        </div>

        {Object.keys(orders).length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow">
            <p className="text-muted mb-0">ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          Object.keys(orders).reverse().map(orderId => { 
            const order = orders[orderId];
            return (
              <div key={orderId} className="card mb-4 shadow border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                {/* 3. ปรับสี Header ของ Order ให้เป็นสีเทาอ่อนหรือสีตามรูปต้นฉบับ */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold text-muted">Order #{orderId}</span>
                  <span className={`badge ${
                    order.status === 'pending' ? 'bg-warning text-dark' : 
                    order.status === 'cancelled' ? 'bg-danger text-white' : 'bg-success'
                  }`} style={{ fontSize: '0.85rem' }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="card-body p-4 bg-white">
                  {order.items.map((item, i) => (
                    <div key={i} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                      <img
                        src={`http://localhost:5000/images/${item.product_img}`}
                        width="80"
                        height="80"
                        className="rounded shadow-sm me-3"
                        style={{ objectFit: 'contain', backgroundColor: '#fefeff' }}
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
                    <h5 className="fw-bold mb-0">ยอดรวมทั้งหมด: <span className="text-primary">฿{Number(order.total_price).toLocaleString()}</span></h5>
                    
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
        
      </div>
    </div>
  );
}

export default Orders;