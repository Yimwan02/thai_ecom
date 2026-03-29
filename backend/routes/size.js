const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ดึงข้อมูลขนาดสินค้า
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM product_size ORDER BY product_size_id ASC';
  db.query(sql, (err, data) => {
    if (err) {
      console.log('GET SIZE ERROR:', err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

// เพิ่มขนาดสินค้า
router.post('/add', (req, res) => {
  const sql = 'INSERT INTO product_size (product_size_name) VALUES (?)';
  db.query(sql, [req.body.product_size_name], (err, data) => {
    if (err) {
      console.log('ADD SIZE ERROR:', err);
      return res.status(500).json(err);
    }
    return res.json({ message: 'Size added successfully' });
  });
});

// แก้ไขขนาดสินค้า
router.put('/update/:id', (req, res) => {
  const sql = 'UPDATE product_size SET product_size_name = ? WHERE product_size_id = ?';
  db.query(sql, [req.body.product_size_name, req.params.id], (err, data) => {
    if (err) {
      console.log('UPDATE SIZE ERROR:', err);
      return res.status(500).json(err);
    }
    return res.json({ message: 'Size updated successfully' });
  });
});

// ลบขนาดสินค้า
router.delete('/delete/:id', (req, res) => {
  const sql = 'DELETE FROM product_size WHERE product_size_id = ?';
  db.query(sql, [req.params.id], (err, data) => {
    if (err) {
      console.log('DELETE SIZE ERROR:', err);
      return res.status(500).json(err);
    }
    return res.json({ message: 'Size deleted successfully' });
  });
});

module.exports = router;