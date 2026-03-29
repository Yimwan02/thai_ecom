const multer = require("multer");
const path = require("path");
const fs = require("fs");

// โฟลเดอร์เก็บรูปจริง
const imageDir = path.join(__dirname, "../public/images");

// ถ้ายังไม่มีโฟลเดอร์ images ให้สร้างขึ้นมาอัตโนมัติ
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// กำหนดตำแหน่งและชื่อไฟล์ตอนอัปโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9ก-๙_-]/g, "_")
      .toLowerCase();

    // กันชื่อไฟล์ซ้ำ โดยใช้เวลา timestamp นำหน้า
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

// อนุญาตเฉพาะไฟล์รูป
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("อนุญาตเฉพาะไฟล์รูป jpg, jpeg, png, webp"));
  }
};

// ตั้งค่า multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // จำกัดไม่เกิน 5MB
});

// ฟังก์ชันลบรูปเก่า ใช้ตอนแก้ไข/ลบสินค้า
const removeImageIfExists = (filename) => {
  if (!filename) return;

  const fullPath = path.join(imageDir, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  removeImageIfExists
};