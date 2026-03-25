import { useEffect } from "react";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔐 กันคนที่ยังไม่ได้ login
  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, []);

  // 🚪 logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Home</h2>

      <p>ยินดีต้อนรับ: {user?.username}</p>

      <br />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;