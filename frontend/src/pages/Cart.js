import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, increaseQty, decreaseQty, removeItem, totalPrice } = useContext(CartContext);

  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2>ตะกร้าสินค้า</h2>

      {cart.length === 0 ? (
        <p>ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={index} className="d-flex justify-content-between border-bottom py-3">
              
              <div className="d-flex align-items-center gap-3">
            <img src={`http://localhost:5000/images/${item.image}`} 
                    width="80"/>

                <div>
                    <p>{item.name}</p>
                    <p>ไซส์: {item.size}</p>
                    <p>฿{item.price}</p>
                </div>
                </div>

              <div>
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <span className="mx-2">{item.quantity}</span>
                <button onClick={() => increaseQty(item.id)}>+</button>
              </div>

              <div>
                ฿{item.price * item.quantity}
              </div>

              <button onClick={() => removeItem(item.id)}>
                ลบ
              </button>

            </div>
          ))}

        <h3 className="mt-4">รวม: ฿{totalPrice}</h3>
        
        <Link to="/checkout">
            <button className="btn btn-success w-100 mt-3">
                ดำเนินการชำระเงิน
            </button>
        </Link>

        <button
          className="btn btn-primary w-100 mt-2"
          onClick={() => navigate('/orders')}
        >
          ดูคำสั่งซื้อ
        </button>
        </>
      )}
    </div>
  );
}

export default Cart;