const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. ดึงประเภทสินค้าทั้งหมด + นับจำนวนสินค้าในแต่ละประเภท
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            pt.product_type_id, 
            pt.product_type_name, 
            COUNT(p.product_id) AS product_count 
        FROM product_type pt 
        LEFT JOIN products p ON pt.product_type_id = p.product_type_id 
        GROUP BY pt.product_type_id`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });
});

// 2. เพิ่มประเภทสินค้าใหม่
router.post('/add', (req, res) => {
    // แก้ชื่อคอลัมน์ให้ตรงกับ DB คือ product_type_name
    const sql = "INSERT INTO product_type (product_type_name) VALUES (?)";
    db.query(sql, [req.body.product_type_name], (err, result) => {
        if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json(err);
        }
        return res.json({ message: "Success", id: result.insertId });
    });
});

// 3. ลบประเภทสินค้า
router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    // แก้ชื่อคอลัมน์ให้ตรงกับ DB คือ product_type_id
    const sql = "DELETE FROM product_type WHERE product_type_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Delete Error:", err);
            return res.status(500).json(err);
        }
        return res.json({ message: "Deleted" });
    });
});

// 4. แก้ไขประเภทสินค้า 
router.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { product_type_name } = req.body;
    const sql = "UPDATE product_type SET product_type_name = ? WHERE product_type_id = ?";
    db.query(sql, [product_type_name, id], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json(err);
        }
        return res.json({ message: "Updated" });
    });
});
module.exports = router;