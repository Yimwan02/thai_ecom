import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    // ✅ เช็คกรอกข้อมูล
    if (!username.trim() || !password.trim()) {
      alert("กรุณากรอก Username และ Password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        username,
        password
      });

      // ✅ แก้เงื่อนไขให้ตรงกับที่ Server ส่งมา (หรือเช็ค status 200)
      if (res.status === 200) {
        alert("สมัครสมาชิกสำเร็จ ✅");
        window.location.href = "/"; // กลับหน้า Login
      }
    } catch (err) {
      console.error(err);
      // ✅ ถ้า Error 500 หรือชื่อซ้ำ
      if (err.response && err.response.status === 500) {
        alert("Username นี้มีอยู่แล้ว หรือข้อมูลไม่ถูกต้อง ❗");
      } else {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ ❌");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center" style={{ width: "350px" }}>
        
        {/* 1. โลโก้แมนยู (ใช้ตัวเดียวกับหน้า Login) */}
        <img 
          src="logo-thailand.jpg" 
          alt="thai Logo" 
          style={{ width: "120px", marginBottom: "20px" }} 
        />

        {/* 2. หัวข้อ Register */}
        <h1 className="fw-bold mb-1" style={{ fontSize: "2.5rem", fontFamily: "serif" }}>Register</h1>
        <p className="text-muted mb-4">
          Join the Changsuek Shop
        </p>

        {/* 3. ช่องกรอกข้อมูลสไตล์โค้งมน (เหมือนหน้า Login) */}
        <div className="mb-2">
          <input
            type="text"
            className="form-control py-3 px-4 shadow-sm"
            style={{ borderRadius: "15px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            className="form-control py-3 px-4 shadow-sm"
            style={{ borderRadius: "15px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 4. ปุ่มสมัครสมาชิก (สีแดงหลัก) */}
        <button
          className="btn btn-danger w-100 py-3 fw-bold shadow-sm mb-3"
          style={{ 
            borderRadius: "15px", 
            backgroundColor: "#000033", // สีน้ำเงินเข้มขึ้นกว่า Continue เล็กน้อยเพื่อความชัดเจน
            border: "none",
            fontSize: "1.1rem"
          }}
          onClick={handleRegister}
        >
          Sign Up
        </button>

        {/* 5. ลิงก์ย้อนกลับ */}
        <p className="text-muted">
          Already have an account? 
          <span 
            className="text-primary ms-1" 
            style={{ cursor: "pointer", textDecoration: "none", fontWeight: "bold" }}
            onClick={() => (window.location.href = "/")}
          >
            Log In
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;