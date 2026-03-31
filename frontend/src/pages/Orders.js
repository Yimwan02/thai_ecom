import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ แนะนำให้ใช้ axios เพื่อให้เหมือนหน้าอื่น

function Orders() {
  const [orders, setOrders] = useState({});
  const navigate = useNavigate();

  // 1. ดึงข้อมูล User จาก LocalStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const cancelOrder = (id) => {
    if (!window.confirm("คุณแน่ใจว่าต้องการยกเลิกคำสั่งซื้อนี้?")) return;

    // ✅ ใช้ axios หรือ fetch ก็ได้แต่เปลี่ยนเป็น PUT ตามที่แก้ใน server
    axios.put(`http://localhost:5000/api/orders/cancel/${id}`)
      .then(() => {
        alert("ยกเลิกสำเร็จ");
        fetchOrders(); // ✅ ใช้ฟังก์ชันโหลดข้อมูลใหม่แทนการ reload หน้า
      })
      .catch(err => console.error(err));
  };

  const handleEditOrder = async (order, id) => {
    if (!window.confirm("ต้องการแก้ไขออเดอร์นี้ใช่ไหม? (ระบบจะยกเลิกออเดอร์เดิมและพาคุณไปหน้าตะกร้า)")) return;
    try {
      await fetch(`http://localhost:5000/api/orders/cancel/${id}`, { method: 'PUT' });
      navigate('/Checkout'); 
    } catch (err) {
      console.error("Edit error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };


  // 2. แยกฟังก์ชันดึงข้อมูลออกมาเพื่อให้เรียกใช้ซ้ำได้
  const fetchOrders = async () => {
    try {
      if (!user || !user.user_id) return;

      // ✅ ส่ง user_id ไปกรองที่ Backend
      const res = await axios.get(`http://localhost:5000/api/orders?user_id=${user.user_id}`);
      const data = res.data;

      const grouped = {};
      data.forEach(item => {
        if (!grouped[item.order_id]) {
          grouped[item.order_id] = {
            total_amount: item.total_amount,
            status: item.status,
            items: []
          };
        }
        grouped[item.order_id].items.push(item);
      });
      setOrders(grouped);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ backgroundColor: "#000033", minHeight: "100vh", paddingBottom: "40px" }}>
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
            <p className="text-muted mb-0">ยังไม่มีประวัติการสั่งซื้อของคุณ</p>
          </div>
        ) : (
          Object.keys(orders).reverse().map(orderId => {
            const order = orders[orderId];
            return (
              <div key={orderId} className="card mb-4 shadow border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold text-muted">Order #{orderId}</span>
                  <span className={`badge ${order.status === 'pending' ? 'bg-warning text-dark' :
                    order.status === 'cancelled' ? 'bg-danger text-white' : 'bg-success'
                    }`} style={{ fontSize: '0.85rem' }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="card-body p-4 bg-white">
                  {order.items.map((product, i) => (
                    <div key={i} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                      <img
                        src={`http://localhost:5000/images/${product.product_img}`}
                        width="80"
                        height="80"
                        className="rounded shadow-sm me-3"
                        style={{ objectFit: 'contain', backgroundColor: '#fefeff' }}
                        alt={product.product_name}
                      />
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-bold">{product.product_name}</p>
                        <small className="text-muted">จำนวน {product.quantity} ชิ้น</small>
                        <p className="mb-0 text-primary fw-bold">฿{Number(product.subtotal).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <h5 className="fw-bold mb-0">ยอดรวมทั้งหมด: <span className="text-primary">฿{Number(order.total_amount || 0).toLocaleString()}</span></h5>

                    {order.status === "pending" && (
                      <div className="d-flex gap-2"> 
                        {/* ปุ่มแก้ไข  */}
                        <button
                          className="btn btn-warning btn-sm px-3 fw-boldshadow-sm"
                          style={{ borderRadius: '8px' }}
                          onClick={() => handleEditOrder(order, orderId)}
                        >
                          แก้ไขคำสั่งซื้อ
                        </button>

                        {/* ปุ่มยกเลิก*/}
                        <button
                          className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
                          style={{ borderRadius: '8px' }}
                          onClick={() => cancelOrder(orderId)}
                        >
                          ยกเลิกคำสั่งซื้อ
                        </button>
                        
                      </div>
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