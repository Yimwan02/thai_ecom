import { useState } from "react";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role_id === 1) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/User";
      }
    } catch {
      alert("Login ไม่ถูกต้อง");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center" style={{ width: "350px" }}>
        
        {/* 1. โลโก้ด้านบน (เปลี่ยน path รูปตามที่คุณมี) */}
        <img 
          src="logo-thailand.jpg" 
          alt="thai Logo" 
          style={{ width: "120px", marginBottom: "20px" }} 
        />

        {/* 2. หัวข้อ Log In */}
        <h1 className="fw-bold mb-1" style={{ fontSize: "2.5rem", fontFamily: "serif" }}>Log In</h1>
        
        <p className="text-muted mb-4">
          Don't have an account? 
          <span 
            className="text-danger ms-1" 
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => (window.location.href = "/register")}
          >
            Create an account
          </span>
        </p>

        {/* 3. ช่องกรอกข้อมูลสไตล์ MU (มนและเทาอ่อน) */}
        <div className="mb-3">
          <input
            className="form-control py-3 px-4 shadow-sm"
            style={{ borderRadius: "15px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            className="form-control py-3 px-4 shadow-sm"
            style={{ borderRadius: "15px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 4. ปุ่ม Continue (สีน้ำเงิน/ฟ้า) */}
        <button 
          className="btn btn-danger w-100 py-3 fw-bold shadow-sm" 
          style={{ 
            borderRadius: "15px", 
            backgroundColor: "#1f67af", 
            border: "none", 
            color: "white",
            fontSize: "1.1rem"
          }} 
          onClick={handleLogin}
          onMouseOver={(e) => e.target.style.backgroundColor = "#000033"} // เปลี่ยนเป็นสีน้ำเงินเข้มเวลาชี้
          onMouseOut={(e) => e.target.style.backgroundColor = "#1f67af"}
        >
          Continue
        </button>

      </div>
    </div>
  );
}

export default Login;