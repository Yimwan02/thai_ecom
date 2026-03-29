const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// ==========================================
// 1. Middleware & Configuration
// ==========================================
app.use(cors());
app.use(express.json());

// ตั้งค่า Static Folder สำหรับรูปภาพ
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// ==========================================
// 2. Authentication API (Login/Register)
// ==========================================

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? AND password = MD5(?)`;
    
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        res.json({ message: "Login success", user: results[0] });
    });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const role_id = 2;

    const checkSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkSql, [username], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) return res.status(400).json({ message: "ชื่อผู้ใช้นี้มีคนใช้แล้ว!" });

        const insertSql = "INSERT INTO users (username, password, role_id) VALUES (?, MD5(?), ?)";
        db.query(insertSql, [username, password, role_id], (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "สมัครสมาชิกสำเร็จ!" });
        });
    });
});

// ==========================================
// 3. Products API
// ==========================================

app.get("/api/products", (req, res) => {
    const sql = `
        SELECT p.*, s.product_size_name 
        FROM products p 
        LEFT JOIN product_size s ON p.product_size_id = s.product_size_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get("/api/products/:id", (req, res) => {
    const sql = `SELECT * FROM products WHERE product_id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: "ไม่พบสินค้า" });
        res.json(results[0]);
    });
});

// ==========================================
// 4. Orders API (ปรับปรุงให้ตรงกับตารางใน phpMyAdmin)
// ==========================================

// ดึงประวัติคำสั่งซื้อ
app.get("/api/orders", (req, res) => {
    const sql = `
        SELECT o.order_id, o.total_price, o.status, o.order_date,
               od.quantity, od.subtotal, 
               p.product_name, p.product_img
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN products p ON od.product_id = p.product_id
        ORDER BY o.order_id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Fetch Orders Error:", err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

// สร้างคำสั่งซื้อใหม่
app.post("/api/orders", (req, res) => {
    const { cart, total } = req.body;
    const user_id = 1; // สมมติ user_id เป็น 1 ตามโครงสร้างตารางของคุณ

    // ปรับ SQL ให้ตรงกับ Column: user_id, order_date, total_price, status
    const sqlOrder = "INSERT INTO orders (user_id, order_date, total_price, status) VALUES (?, NOW(), ?, 'pending')";
    
    db.query(sqlOrder, [user_id, total], (err, result) => {
        if (err) {
            console.error("Insert Order Error:", err);
            return res.status(500).json({ error: "ไม่สามารถสร้าง Order ได้", details: err.message });
        }

        const orderId = result.insertId;

        // บันทึกรายละเอียดลง order_details
        const sqlDetails = "INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ?";
        const values = cart.map(item => [
            orderId, 
            item.product_id, 
            item.quantity, 
            (item.price * item.quantity)
        ]);

        db.query(sqlDetails, [values], (err2) => {
            if (err2) {
                console.error("Insert Details Error:", err2);
                return res.status(500).json({ error: "ไม่สามารถบันทึกรายละเอียดได้", details: err2.message });
            }
            res.json({ message: "สั่งซื้อสำเร็จ!", orderId: orderId });
        });
    });
});

// ยกเลิกคำสั่งซื้อ
app.put("/api/orders/cancel/:id", (req, res) => {
    const sql = "UPDATE orders SET status = 'cancelled' WHERE order_id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "ยกเลิกคำสั่งซื้อเรียบร้อย" });
    });
});

// ==========================================
// 5. Admin Panel API
// ==========================================

app.post('/api/users', (req, res) => {
    const { username, password, role_id } = req.body;
    const sql = "INSERT INTO users (username, password, role_id) VALUES (?, MD5(?), ?)";
    db.query(sql, [username, password, role_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "เพิ่มผู้ใช้สำเร็จ!", id: result.insertId });
    });
});

app.get('/api/users', (req, res) => {
    const sql = "SELECT user_id, username, role_id FROM users"; 
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/product-types', (req, res) => {
    const sql = `
        SELECT pt.product_type_id, pt.product_type_name, COUNT(p.product_id) AS product_count
        FROM product_type pt
        LEFT JOIN products p ON pt.product_type_id = p.product_type_id
        GROUP BY pt.product_type_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ==========================================
// 6. Start Server
// ==========================================
app.listen(5000, () => {
    console.log("-----------------------------------------");
    console.log("🚀 Server running on http://localhost:5000");
    console.log("-----------------------------------------");
});