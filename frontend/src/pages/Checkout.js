import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cart, totalPrice, clearCart } = useContext(CartContext);

  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("cod");

  const navigate = useNavigate();

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า");
      return;
    }

    if (!address) {
      alert("กรุณากรอกที่อยู่");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: cart,
          total: totalPrice,
          address: address,
          payment: payment,
        }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        alert("สั่งซื้อสำเร็จ 🎉");

        // ล้างตะกร้า
        clearCart();

        // (ถ้ามีหน้า success)
        // navigate("/success");
      } else {
        alert(data.message || "เกิดข้อผิดพลาด");
      }

    } catch (error) {
      console.log(error);
      alert("เชื่อมต่อ server ไม่ได้");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      {/* 🧾 รายการสินค้า */}
      <div className="mb-4">
        <h4>รายการสินค้า</h4>

        {cart.map((item, index) => (
          <div key={index} className="d-flex justify-content-between border-bottom py-2">
            <img
              src={`http://localhost:5000/images/${item.image}`} // item.image = product_img จาก DB
              alt={item.name}
              width={80}
              className="me-3"
            />
            <div>
              <p>{item.name} (ไซส์: {item.size})</p>
              <p>฿{item.price} x {item.quantity}</p>
            </div>
            <div>
              ฿{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* 📦 ที่อยู่ */}
      <div className="mb-4">
        <h4>ที่อยู่จัดส่ง</h4>
        <textarea
          className="form-control"
          placeholder="กรอกที่อยู่ของคุณ"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* 💳 วิธีจ่ายเงิน */}
      <div className="mb-4">
        <h4>วิธีชำระเงิน</h4>

        <div>
          <input
            type="radio"
            value="cod"
            checked={payment === "cod"}
            onChange={() => setPayment("cod")}
          /> เงินปลายทาง
        </div>

        <div>
          <input
            type="radio"
            value="transfer"
            checked={payment === "transfer"}
            onChange={() => setPayment("transfer")}
          /> โอนเงิน
        </div>
      </div>

      {/* 💰 รวม */}
      <h3>รวมทั้งหมด: ฿{totalPrice}</h3>

      {/* ✅ ปุ่ม */}
      <button onClick={handleOrder} className="btn btn-success w-100 mt-3">
        ยืนยันคำสั่งซื้อ
      </button>

      <button
        className="btn btn-primary mt-2 w-100"
        onClick={() => navigate('/orders')}>
      
        ดูคำสั่งซื้อ
      </button>

      <button className="btn btn-secondary mt-2 w-100"
        onClick={() => navigate('/user')} >
        กลับหน้าหลัก
      </button>
    </div>
  );
}

export default Checkout;