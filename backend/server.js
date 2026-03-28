const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- จุดที่แก้ไข: การเข้าถึงไฟล์รูปภาพ ---
// ใช้ path.resolve เพื่อให้มั่นใจว่าหาโฟลเดอร์เจอแน่นอน
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// --- 1. API สำหรับรายการสินค้า ---
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT p.*, s.product_size_name 
    FROM products p
    LEFT JOIN product_size s ON p.product_size_id = s.product_size_id
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/product', (req, res) => {
  res.redirect('/api/products');
});

// --- 2. Routes อื่นๆ ---
const authRoutes = require("./routes/auth");
const productTypeRoutes = require("./routes/productType");

app.use("/api", authRoutes);
app.use("/api/product-types", productTypeRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API running on port 5000");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  db.query("SELECT DATABASE()", (err, rows) => {
    if (err) return console.error("DB Connection Error:", err);
    console.log("ขณะนี้กำลังเชื่อมต่อกับฐานข้อมูลชื่อ:", rows[0]['DATABASE()']);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params; // รับเลข ID จาก URL (เช่น เลข 1)
  const sql = `
    SELECT p.*, s.product_size_name 
    FROM products p 
    LEFT JOIN product_size s ON p.product_size_id = s.product_size_id 
    WHERE p.product_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้าชิ้นนี้" });
    }

    res.json(results[0]); // ส่งกลับไปแค่ Object เดียว (สินค้าตัวที่เลือก)
  });
});