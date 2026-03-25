import { useEffect } from "react";

function User() {
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role_id !== 2) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Page</h2>
      <p>ยินดีต้อนรับ: {user?.username}</p>

      <button onClick={() => {
        localStorage.removeItem("user");
        window.location.href = "/";
      }}>
        Logout
      </button>
    </div>
  );
}

export default User;