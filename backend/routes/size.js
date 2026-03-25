const express = require('express');
const router = express.Router();
const db = require('../db'); // เช็คให้ชัวร์ว่า path ตรงกับไฟล์เชื่อมต่อ DB ของคุณ

// 1. ดึงขนาดทั้งหมด (GET)
router.get('/', (req, res) => {
    const sql = "SELECT * FROM sizes";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 2. เพิ่มขนาดใหม่ (POST)
router.post('/add', (req, res) => {
    const sql = "INSERT INTO sizes (size_name) VALUES (?)";
    db.query(sql, [req.body.size_name], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Size added successfully");
    });
});

// 3. แก้ไขขนาด (PUT)
router.put('/update/:id', (req, res) => {
    const sql = "UPDATE sizes SET size_name = ? WHERE id = ?";
    db.query(sql, [req.body.size_name, req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Size updated successfully");
    });
});

// 4. ลบขนาด (DELETE)
router.delete('/delete/:id', (req, res) => {
    const sql = "DELETE FROM sizes WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Size deleted successfully");
    });
});

module.exports = router;