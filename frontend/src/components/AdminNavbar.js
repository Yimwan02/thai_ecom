function AdminNavbar({ user, setPage }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <img src="/logo-thailand.jpg" alt="Logo" style={{ height: "50px", marginRight: "15px" }} />
      <span className="navbar-brand"> Admin</span>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* MENU */}
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setPage("users")}
        >
          👤 ผู้ใช้
        </button>

        <button
          className="btn btn-outline-success btn-sm ms-2"
          onClick={() => setPage("monthlyProductSales")}
        >
          💰 ยอดสั่งซื้อสินค้า
        </button>
        <button
          className="btn btn-outline-warning btn-sm"
          onClick={() => setPage("products")}
        >
          🛍 สินค้า
        </button>

        {/* แก้ไขตรงนี้: เพิ่มเครื่องหมาย > หลัง onClick */}
        <button
          className="btn btn-outline-info btn-sm ms-2"
          onClick={() => setPage("productTypes")}
        >
          📊 ประเภทสินค้า
        </button>

        <button
          className="btn btn-warning btn-sm fw-bold mx-1"
          onClick={() => setPage("sizes")}
        >
          📏 แก้ไขไซส์
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