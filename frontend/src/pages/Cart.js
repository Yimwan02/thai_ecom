import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom"; 

function Cart() {
  const { cart, increaseQty, decreaseQty, removeItem, totalPrice } = useContext(CartContext);

  return (
    <div className="cart-page-bg">
      <div className="container">
        <div className="cart-container">
          <h2 className="fw-bold mb-4" style={{ color: '#000033' }}>🛒 ตะกร้าสินค้าของคุณ</h2>

          {cart.length > 0 ? (
            cart.map((item) => (
              <div className="cart-item-row" key={`${item.product_id}-${item.size}`}>
                <img
                  src={`http://localhost:5000/images/${item.product_img}`}
                  className="cart-item-img"
                  alt={item.product_name}
                  onError={(e) => e.target.src = "https://placehold.co/100?text=No+Image"}
                />

                <div className="ms-4 flex-grow-1">
                  <h5 className="fw-bold mb-1">{item.product_name}</h5>
                  <p className="text-secondary mb-0">ไซส์: <span className="badge bg-light text-dark">{item.size}</span></p>
                  <p className="fw-bold text-dark mt-1">฿{Number(item.price).toLocaleString()}</p>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <button className="qty-btn" onClick={() => decreaseQty(item.product_id, item.size)}>-</button>
                  <span className="fw-bold">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => increaseQty(item.product_id, item.size)}>+</button>
                </div>

                <div className="ms-5 text-end" style={{ minWidth: '120px' }}>
                  <p className="fw-bold mb-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                  <button className="btn-remove" onClick={() => removeItem(item.product_id, item.size)}>ลบออก</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <h5 className="text-muted">ไม่มีสินค้าในตะกร้า</h5>
              <Link to="/User" className="btn btn-outline-primary mt-3">กลับไปเลือกสินค้า</Link>
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-5 text-end">
              <h4 className="text-secondary">ยอดรวมทั้งหมด</h4>
              <p className="total-price-text">฿{totalPrice.toLocaleString()}</p>

              <div className="row justify-content-end mt-4">
                <div className="col-md-4 d-grid gap-2">
                  {/* ✅ ลิ้งไปหน้า Checkout ที่เพื่อนทำ */}
                  <Link to="/checkout" className="btn-checkout text-decoration-none text-center p-2 rounded text-white" style={{backgroundColor: '#000033'}}>
                    ดำเนินการชำระเงิน
                  </Link>
                  <Link to="/orders" className="btn-view-orders text-decoration-none text-center p-2 rounded border border-dark text-dark">
                    ดูประวัติคำสั่งซื้อ
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;