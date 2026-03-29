import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Orders() {

  const [orders,setOrders] = useState({});

  const navigate = useNavigate();

 const cancelOrder = (id) => {
  fetch(`http://localhost:5000/api/orders/cancel/${id}`, {
    method: 'PUT'
  })
  .then(res => res.json())
  .then(() => {
    alert("ยกเลิกสำเร็จ");
    window.location.reload();
  });
};

  useEffect(()=>{

    fetch("http://localhost:5000/api/orders")
      .then(res=>res.json())
      .then(data=>{

        const grouped = {};

        data.forEach(item => {

          if(!grouped[item.order_id]){
            grouped[item.order_id] = {
              total_price:item.total_price,
              status:item.status,
              items:[]
            };
          }

          grouped[item.order_id].items.push(item);

        });

        setOrders(grouped);
      });

  },[]);

  return (
    <div className="container mt-5">
      <h2>ประวัติการสั่งซื้อ</h2>

      {Object.keys(orders).map(orderId=>{

        const order = orders[orderId];

        return(
          <div key={orderId} className="border p-3 mb-4">

            <h4>Order #{orderId}</h4>

            {order.items.map((item,i)=>(
              <div key={i} className="d-flex mb-2">

                <img
                  src={`http://localhost:5000/images/${item.product_img}`}
                  width="100"
                />

                <div className="ms-3">
                  <p>{item.product_name}</p>
                  <p>จำนวน {item.quantity}</p>
                  <p>฿{item.subtotal}</p>
                </div>

              </div>
            ))}

            <hr/>
            <h5>รวม: ฿{order.total_price}</h5>
            <p>สถานะ: {order.status}</p>
            {order.status === "pending" && (
              <button
                className="btn btn-danger mt-2"
                onClick={() => cancelOrder(orderId)}
              >
                ยกเลิกคำสั่งซื้อ
              </button>
            )}

            

          </div>
        );
      })}

       <button
      className="btn btn-secondary w-100 mt-3"
      onClick={() => navigate('/user')}
    >
      กลับหน้าหลัก
    </button>
    </div>
  );
}

export default Orders;