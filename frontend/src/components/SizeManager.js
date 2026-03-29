import { useState, useEffect } from "react";
import axios from "axios";

function SizeManager() {
    const [sizes, setSizes] = useState([]);
    const [newSize, setNewSize] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    useEffect(() => { fetchSizes(); }, []);

    const fetchSizes = async () => {
        const res = await axios.get("http://localhost:5000/api/sizes");
        setSizes(res.data);
    };

    const handleAdd = async () => {
        if (!newSize) return alert("กรุณากรอกชื่อไซส์");
        await axios.post("http://localhost:5000/api/sizes", { size_name: newSize });
        setNewSize("");
        fetchSizes();
    };

    const handleUpdate = async (id) => {
        try {
            // เช็คตัวสะกด /api/sizes/${id} ให้ดีครับ (ใช้ Backtick ` นะครับไม่ใช่ ')
            await axios.put(`http://localhost:5000/api/sizes/${id}`, { size_name: editName });
            setEditId(null);
            fetchSizes();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("ยืนยันการลบไซส์นี้?")) {
            try {
                await axios.delete(`http://localhost:5000/api/sizes/${id}`);
                fetchSizes();
            } catch (err) {
                alert(err.response.data.message);
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0 rounded-4 p-4">
                <h3 className="fw-bold mb-4">📏 จัดการไซส์สินค้า</h3>

                {/* ส่วนเพิ่มข้อมูล */}
                <div className="input-group mb-4 shadow-sm rounded-3 overflow-hidden">
                    <input
                        type="text"
                        className="form-control border-0 p-3"
                        placeholder="เพิ่มไซส์ใหม่ (เช่น S, M, L, XXL)"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                    />
                    <button className="btn btn-success px-4" onClick={handleAdd}>+ เพิ่มไซส์</button>
                </div>

                {/* ตารางแสดงผล */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>ชื่อไซส์</th>
                                <th className="text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizes.map(s => (
                                <tr key={s.product_size_id}>
                                    <td>{s.product_size_id}</td>
                                    <td>
                                        {editId === s.product_size_id ? (
                                            <input
                                                className="form-control form-control-sm"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        ) : (
                                            <span className="badge bg-info text-dark fs-6">{s.product_size_name}</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {editId === s.product_size_id ? (
                                            <button className="btn btn-primary btn-sm me-2" onClick={() => handleUpdate(s.product_size_id)}>บันทึก</button>
                                        ) : (
                                            <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditId(s.product_size_id); setEditName(s.product_size_name); }}>แก้ไข</button>
                                        )}
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.product_size_id)}>ลบ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SizeManager;