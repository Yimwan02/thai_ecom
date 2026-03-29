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

      if (res.data.message === "Register success") {
        alert("สมัครสมาชิกสำเร็จ ✅");
        window.location.href = "/";
      } else if (res.data.message === "Username already exists") {
        alert("Username นี้มีอยู่แล้ว ❗");
      } else {
        alert("สมัครไม่สำเร็จ ❌");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ❌");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Register</h3>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn btn-success w-100 mb-2"
          onClick={handleRegister}
        >
          สมัครสมาชิก
        </button>

        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => (window.location.href = "/")}
        >
          กลับไป Login
        </button>
      </div>
    </div>
  );
}

export default Register;