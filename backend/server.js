const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();


// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());


// ======================
// Image Folder
// ======================
app.use(
  "/images",
  express.static(path.join(__dirname, "public", "images"))
);


// ======================
// GET PRODUCTS
// ======================
app.get("/api/products", (req, res) => {

  const sql = `
    SELECT p.*, s.product_size_name
    FROM products p
    LEFT JOIN product_size s
    ON p.product_size_id = s.product_size_id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });

});


// ======================
// CREATE ORDER
// ======================
app.post("/api/orders", (req, res) => {

  console.log("BODY =", req.body);

  const { cart, total, address, payment } = req.body;

  console.log("CART DATA =", cart);

  if (!cart || cart.length === 0)
    return res.status(400).json({ message: "Cart empty" });

  if (!address)
    return res.status(400).json({ message: "Address required" });

  const user_id = 1;

  const orderSql = `
    INSERT INTO orders
    (user_id, order_date, total_price, status)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(
    orderSql,
    [user_id, total, "pending"],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      const orderId = result.insertId;

      const detailSql = `
        INSERT INTO order_details
        (order_id, product_id, quantity, subtotal)
        VALUES ?
      `;

      const values = cart.map(item => [
        orderId,
        item.id,
        item.quantity,
        item.price * item.quantity
      ]);

      console.log(values);

      db.query(detailSql, [values], (err2) => {

        if (err2) {
          console.log("DETAIL ERROR:", err2);
          return res.status(500).json(err2);
        }

        res.json({
          message: "Order created",
          order_id: orderId
        });

      });

    }
  );

});


// ======================
// GET ORDERS
// ======================
app.get("/api/orders", (req, res) => {

  const sql = `
    SELECT
      o.order_id,
      o.total_price,
      o.status,
      p.product_name,
      p.product_img,
      od.quantity,
      od.subtotal
    FROM orders o
    JOIN order_details od
      ON o.order_id = od.order_id
    JOIN products p
      ON od.product_id = p.product_id
    ORDER BY o.order_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });

});


// ======================
// GET PRODUCT BY ID
// ======================
app.get("/api/products/:id", (req, res) => {

  const sql = `SELECT * FROM products WHERE product_id = ?`;

  db.query(sql, [req.params.id], (err, results) => {

    if (err) return res.status(500).json(err);

    if (results.length === 0)
      return res.status(404).json({ message: "Not found" });

    res.json(results[0]);
  });

});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT * FROM users
    WHERE username = ? AND password = ?
  `;

  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login success",
      user: results[0]
    });
  });
});

app.put('/api/orders/cancel/:id', (req, res) => {
  const orderId = req.params.id;

  const sql = `
    UPDATE orders
    SET status = 'cancelled'
    WHERE order_id = ? AND status = 'pending'
  `;

  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "ยกเลิกไม่ได้" });
    }

    res.json({ message: "ยกเลิกสำเร็จ" });
  });
});


// ======================
app.listen(5000, () => {
  console.log("Server running on port 5000");

  db.query("SELECT DATABASE()", (err, rows) => {
    if (!err)
      console.log("Connected DB:", rows[0]["DATABASE()"]);
  });
});