const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express(); // ต้องสร้าง app ก่อนเป็นอันดับแรก!

// --- Middleware (ต้องวางหลัง const app) ---
app.use(cors());
app.use(express.json());

// เปิดทางให้ Frontend ดึงรูปจากโฟลเดอร์ public/images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 1. API สำหรับรายการสินค้า ---
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT p.*, s.product_size_name 
    FROM products p  -- เติม s ตรงนี้ให้ตรงกับใน Database
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

// เผื่อเรียกแบบไม่มี s
app.get('/api/product', (req, res) => {
  res.redirect('/api/products');
});

// --- 2. เรียกใช้ Routes อื่นๆ ---
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
  // เพิ่มบรรทัดนี้เพื่อเช็ค
  db.query("SELECT DATABASE()", (err, rows) => {
    console.log("ขณะนี้กำลังเชื่อมต่อกับฐานข้อมูลชื่อ:", rows[0]['DATABASE()']);
  });
});