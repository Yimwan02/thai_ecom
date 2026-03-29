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
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Login</h3>

        <input
          className="form-control mb-2"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>
          Login
        </button>

        <button
  className="btn btn-outline-secondary w-100"onClick={() => (window.location.href = "/register")}>
    Register
    </button>
    
      </div>
    </div>
  );
}

export default Login;