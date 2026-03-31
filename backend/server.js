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

// 1. Authentication & Users
app.get('/api/users', (req, res) => {
    const sql = "SELECT user_id, username, role_id FROM users"; 
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    const sql = "INSERT INTO users (username, password, role_id, created_at) VALUES (?, MD5(?), 2, NOW())";
    
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json(err); // ส่ง Error 500 ถ้าชื่อซ้ำ
        res.status(200).json({ message: "Register success" }); // ส่ง success
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

//  เปลี่ยน Role ผู้ใช้
app.put('/api/users/:id', (req, res) => {
    const { role_id } = req.body;
    const sql = "UPDATE users SET role_id = ? WHERE user_id = ?";
    db.query(sql, [role_id, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Update success" });
    });
});

//  ลบผู้ใช้
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE user_id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            // 1. Log ดูใน Terminal ว่า Error จริงๆ คืออะไร (สำคัญมาก)
            console.error("DB Error:", err); 
            
            // 2. ส่ง Error กลับไปแบบที่อ่านออก เช่น string หรือ object เฉพาะส่วน
            return res.status(500).json({ 
                error: "Database error", 
                detail: err.message // ส่งแค่ message ออกไปจะปลอดภัยกว่า
            });
        }

        // 3. เช็คว่ามีแถวที่ถูกลบจริงไหม (ถ้าส่ง ID ที่ไม่มีอยู่จริงมา)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ไม่พบ User ID นี้ในระบบ" });
        }

        res.json({ message: "Delete success" });
    });
});

//  เพิ่ม API สำหรับแอดมินสร้างผู้ใช้ใหม่
app.post("/api/users/add", (req, res) => {
    const { username, password, role_id } = req.body;
    // ใช้ MD5 ให้เหมือนกับตอน Login นะครับ
    const sql = "INSERT INTO users (username, password, role_id, created_at) VALUES (?, MD5(?), ?, NOW())";
    db.query(sql, [username, password, role_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "ชื่อผู้ใช้อาจซ้ำหรือข้อมูลไม่ถูกต้อง" });
        }
        res.json({ message: "เพิ่มผู้ใช้สำเร็จ" });
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

// 2. Special Reports & Stats 

//  สรุปยอดขาย (Admin Dashboard)
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

//  สรุปจำนวนแยกตามไซส์
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

//  กราฟยอดสั่งซื้อรายเดือนแยกตามสินค้า
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

// 3. Products Management

//  ดึงสินค้าทั้งหมด
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

//  ดึงสินค้าตาม ID
app.get("/api/products/:id", (req, res) => {
    const sql = `SELECT * FROM products WHERE product_id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

//  API สำหรับลบสินค้า (Delete Product)
app.delete("/api/products/delete/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE product_id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "ลบสำเร็จ" });
    });
});
// 4. Order System (รวมทั้งดึงข้อมูล และ บันทึกออเดอร์)

//  4.1 API สำหรับดึงประวัติการสั่งซื้อ (GET) - แยกตาม User
app.get("/api/orders", (req, res) => {
    const { user_id } = req.query; // รับค่าจาก ?user_id=...

    let sql = `
        SELECT 
            o.order_id, o.total_amount, o.status, o.order_date,
            od.quantity, od.subtotal,
            p.product_name, p.product_img, p.price
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN products p ON od.product_id = p.product_id
    `;

    //  กรองข้อมูล: ถ้าส่ง user_id มา ให้ดึงเฉพาะของคนนั้น แยก User ตรงนี้
    if (user_id) {
        sql += ` WHERE o.user_id = ? `;
    }
    sql += ` ORDER BY o.order_date DESC `;

    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

//  4.2 API สำหรับบันทึกคำสั่งซื้อใหม่ (POST)
app.post("/api/orders", (req, res) => {
    const { user_id, address, payment_method, total_amount, cartItems } = req.body;

    // บันทึกลงตาราง orders (แม่)
    const orderSql = "INSERT INTO orders (user_id, address, payment_method, total_amount, status, order_date) VALUES (?, ?, ?, ?, 'pending', NOW())";
    
    db.query(orderSql, [user_id, address, payment_method, total_amount], (err, result) => {
        if (err) {
            console.error("Insert Order Error:", err);
            return res.status(500).json({ error: "บันทึกออเดอร์ไม่สำเร็จ" });
        }

        const orderId = result.insertId;
        
        // บันทึกลงตาราง order_details (ลูก)
        const detailSql = "INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ?";
        const detailValues = cartItems.map(item => [
            orderId, 
            item.product_id, 
            item.quantity, 
            (item.price * item.quantity)
        ]);

        db.query(detailSql, [detailValues], (err2) => {
            if (err2) {
                console.error("Insert Details Error:", err2);
                return res.status(500).json({ error: "บันทึกรายละเอียดไม่สำเร็จ" });
            }
            res.json({ message: "สั่งซื้อสำเร็จ!", order_id: orderId });
        });
    });
});

// 5. Product Types & Sizes & Stats

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

//  เพิ่ม API สำหรับยกเลิกออเดอร์
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


//  เพิ่มสินค้าใหม่
app.post("/api/products/add", upload.single("product_img"), (req, res) => {
    const { product_name, product_type_id, product_size_id, price } = req.body;
    const product_img = req.file ? req.file.filename : null;
    const sql = "INSERT INTO products (product_name, product_type_id, product_size_id, price, product_img) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [product_name, product_type_id, product_size_id, price, product_img], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Add product success" });
    });
});

//  แก้ไขสินค้า (รองรับการเปลี่ยนรูป)
app.put("/api/products/update/:id", upload.single("product_img"), (req, res) => {
    const { product_name, product_type_id, product_size_id, price } = req.body;
    let sql = "UPDATE products SET product_name=?, product_type_id=?, product_size_id=?, price=? WHERE product_id=?";
    let params = [product_name, product_type_id, product_size_id, price, req.params.id];

    if (req.file) {
        sql = "UPDATE products SET product_name=?, product_type_id=?, product_size_id=?, price=?, product_img=? WHERE product_id=?";
        params = [product_name, product_type_id, product_size_id, price, req.file.filename, req.params.id];
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Update product success" });
    });
});

//  1. เพิ่มประเภทสินค้าใหม่ (Path: /api/product-types/add)
app.post("/api/product-types/add", (req, res) => {
    const { product_type_name } = req.body;
    const sql = "INSERT INTO product_type (product_type_name) VALUES (?)";
    db.query(sql, [product_type_name], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "เพิ่มสำเร็จ" });
    });
});

//  2. แก้ไขประเภทสินค้า (Path: /api/product-types/update/:id)
app.put("/api/product-types/update/:id", (req, res) => {
    const { product_type_name } = req.body;
    const sql = "UPDATE product_type SET product_type_name = ? WHERE product_type_id = ?";
    db.query(sql, [product_type_name, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "อัปเดตสำเร็จ" });
    });
});

//  3. ลบประเภทสินค้า (Path: /api/product-types/delete/:id)
app.delete("/api/product-types/delete/:id", (req, res) => {
    const sql = "DELETE FROM product_type WHERE product_type_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "ลบสำเร็จ" });
    });
});

// 7. Size Management (เพิ่มเติมสำหรับหน้า SizeManager)

//  เพิ่มไซส์ใหม่
app.post("/api/sizes/add", (req, res) => {
    const { product_size_name } = req.body;
    const sql = "INSERT INTO product_size (product_size_name) VALUES (?)";
    db.query(sql, [product_size_name], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Add size success", id: result.insertId });
    });
});

//  แก้ไขชื่อไซส์
app.put("/api/sizes/update/:id", (req, res) => {
    const { product_size_name } = req.body;
    const sql = "UPDATE product_size SET product_size_name = ? WHERE product_size_id = ?";
    db.query(sql, [product_size_name, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Update size success" });
    });
});

//  ลบไซส์
app.delete("/api/sizes/delete/:id", (req, res) => {
    const sql = "DELETE FROM product_size WHERE product_size_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Delete size success" });
    });
});

// 6. Start Server
app.listen(5000, () => {
    console.log(" Server is running");
});