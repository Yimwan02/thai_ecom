function AdminNavbar({ user, setPage }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">👑 Admin Panel</span>

      <div className="ms-auto d-flex align-items-center gap-3">

        {/* MENU */}
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setPage("users")}
        >
          👤 ผู้ใช้
        </button>

        <button
          className="btn btn-outline-warning btn-sm"
          onClick={() => setPage("products")}
        >
          🛍 สินค้า
        </button>

        {/* USER */}
        <span className="text-white">
          {user?.username}
        </span>

        {/* LOGOUT */}
        <button
          className="btn btn-danger btn-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;