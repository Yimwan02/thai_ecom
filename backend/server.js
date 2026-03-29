const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");
const { upload, removeImageIfExists } = require("./middlewares/upload");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ตั้งค่า Static Folder สำหรับรูปภาพ
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// ==========================================
// 1. Authentication & Users
// ==========================================
app.get('/api/users', (req, res) => {
    const sql = "SELECT user_id, username, role_id FROM users"; 
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? AND password = MD5(?)`;
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        res.json({ message: "Login success", user: results[0] });
    });
});

app.get("/api/users/stats/monthly", (req, res) => {
    const sql = `SELECT MONTH(created_at) AS month, COUNT(*) AS total FROM users GROUP BY MONTH(created_at) ORDER BY month`;
    db.query(sql, (err, results) => {
        if (err) {
            const fallbackSql = `SELECT MONTH(order_date) AS month, COUNT(DISTINCT user_id) AS total FROM orders GROUP BY month`;
            db.query(fallbackSql, (err2, res2) => res.json(res2));
        } else {
            res.json(results);
        }
    });
});

// ==========================================
// 2. Special Reports & Stats (วางไว้ก่อน Route ที่มี :id)
// ==========================================

// ✅ สรุปยอดขาย (Admin Dashboard)
app.get("/api/products/sales-summary", (req, res) => {
    const sql = `
        SELECT
            p.product_id, p.product_name, p.product_img,
            COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN od.quantity ELSE 0 END), 0) AS total_quantity,
            COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN od.subtotal ELSE 0 END), 0) AS total_revenue,
            COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN od.subtotal ELSE 0 END), 0) AS total_sales,
            COUNT(DISTINCT CASE WHEN o.status <> 'cancelled' THEN o.order_id END) AS total_orders,
            MAX(CASE WHEN o.status <> 'cancelled' THEN o.order_date END) AS last_order_date
        FROM products p
        LEFT JOIN order_details od ON p.product_id = od.product_id
        LEFT JOIN orders o ON od.order_id = o.order_id
        GROUP BY p.product_id, p.product_name, p.product_img
        ORDER BY total_quantity DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ✅ สรุปจำนวนแยกตามไซส์
app.get("/api/products/size-counts", (req, res) => {
    const sql = `
        SELECT s.product_size_name, COUNT(p.product_id) AS product_count 
        FROM product_size s
        LEFT JOIN products p ON s.product_size_id = p.product_size_id
        GROUP BY s.product_size_id, s.product_size_name
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ✅ กราฟยอดสั่งซื้อรายเดือนแยกตามสินค้า
app.get("/api/orders/stats/monthly-products", (req, res) => {
    const sql = `
        SELECT MONTH(o.order_date) AS month, SUM(od.quantity) AS total_quantity 
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        WHERE o.status <> 'cancelled'
        GROUP BY month ORDER BY month ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ==========================================
// 3. Products Management
// ==========================================

// ✅ ดึงสินค้าทั้งหมด
app.get("/api/products", (req, res) => {
    const sql = `
        SELECT p.*, pt.product_type_name, s.product_size_name
        FROM products p 
        LEFT JOIN product_type pt ON p.product_type_id = pt.product_type_id
        LEFT JOIN product_size s ON p.product_size_id = s.product_size_id
        ORDER BY p.product_id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ✅ ดึงสินค้าตาม ID
app.get("/api/products/:id", (req, res) => {
    const sql = `SELECT * FROM products WHERE product_id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// ==========================================
// 4. Order System (Checkout & History)
// ==========================================

// ✅ บันทึกคำสั่งซื้อ
app.post("/api/orders", (req, res) => {
    const { user_id, address, payment_method, total_amount, cartItems } = req.body;
    const orderSql = "INSERT INTO orders (user_id, address, payment_method, total_amount, status, order_date) VALUES (?, ?, ?, ?, 'pending', NOW())";
    
    db.query(orderSql, [user_id || 1, address, payment_method, total_amount], (err, result) => {
        if (err) return res.status(500).json(err);
        const orderId = result.insertId;
        const detailSql = "INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ?";
        const detailValues = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price * item.quantity]);

        db.query(detailSql, [detailValues], (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "สั่งซื้อสำเร็จ!", order_id: orderId });
        });
    });
});

// ✅ ดึงประวัติการสั่งซื้อแบบละเอียด (แก้ปัญหา NaN และรูปไม่ขึ้น)
// ✅ แก้ไข SQL ให้ดึงค่าจาก total_amount (เพราะใน DB ของ Artty ตัวเลขอยู่ที่นี่)
app.get("/api/orders", (req, res) => {
    const sql = `
        SELECT 
            o.order_id, 
            o.total_amount,        -- ✅ ดึงจากคอลัมน์ที่มีข้อมูลจริง
            o.total_amount AS total, -- ✅ เผื่อ Frontend เรียกใช้ item.total
            o.status, 
            o.order_date,
            od.quantity, 
            od.subtotal,
            p.product_name, 
            p.product_img, 
            p.price
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN products p ON od.product_id = p.product_id
        ORDER BY o.order_date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error fetching orders:", err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

// ==========================================
// 5. Product Types & Sizes & Stats
// ==========================================

app.get('/api/product-types', (req, res) => {
    const sql = `
        SELECT pt.product_type_id, pt.product_type_name, COUNT(p.product_id) AS product_count
        FROM product_type pt
        LEFT JOIN products p ON pt.product_type_id = p.product_type_id
        GROUP BY pt.product_type_id, pt.product_type_name
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get("/api/sizes", (req, res) => {
    db.query("SELECT * FROM product_size", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get("/api/orders/stats/monthly", (req, res) => {
    const sql = `SELECT MONTH(order_date) AS month, COUNT(*) AS total FROM orders WHERE status <> 'cancelled' GROUP BY month ORDER BY month`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ✅ เพิ่ม API สำหรับยกเลิกออเดอร์
app.put("/api/orders/cancel/:id", (req, res) => {
    const orderId = req.params.id;
    // ปรับสถานะเป็น 'cancelled'
    const sql = "UPDATE orders SET status = 'cancelled' WHERE order_id = ?";
    
    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error("❌ Error cancelling order:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "ยกเลิกคำสั่งซื้อสำเร็จ" });
    });
});

// ==========================================
// 6. Start Server
// ==========================================
app.listen(5000, () => {
    console.log("🚀 Server is back online with all fixed routes!");
});