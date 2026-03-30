import { useState, useEffect } from "react";
import axios from "axios";

function SizeManager() {
    const [sizes, setSizes] = useState([]);
    const [newSize, setNewSize] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    useEffect(() => { fetchSizes(); }, []);

    const fetchSizes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/sizes");
            setSizes(res.data);
        } catch (err) {
            console.error("Error fetching sizes:", err);
        }
    };

    const handleAdd = async () => {
        if (!newSize) return alert("กรุณากรอกชื่อไซส์");
        try {
            // ✅ แก้ Path ให้ตรงกับ server.js (เติม /add)
            await axios.post("http://localhost:5000/api/sizes/add", { product_size_name: newSize });
            setNewSize("");
            fetchSizes();
            alert("เพิ่มไซส์สำเร็จ");
        } catch (err) {
            console.error(err);
            alert("เพิ่มไม่สำเร็จ");
        }
    };

    const handleUpdate = async (id) => {
        if (!editName) return alert("กรุณากรอกชื่อไซส์");
        try {
            // ✅ แก้ Path ให้ตรงกับ server.js (เติม /update/)
            await axios.put(`http://localhost:5000/api/sizes/update/${id}`, { product_size_name: editName });
            setEditId(null);
            fetchSizes();
            alert("แก้ไขสำเร็จ");
        } catch (err) {
            console.error(err);
            alert("แก้ไขไม่สำเร็จ");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("ต้องการลบไซส์นี้ใช่หรือไม่?")) return;
        try {
            // ✅ แก้ Path ให้ตรงกับ server.js (เติม /delete/)
            await axios.delete(`http://localhost:5000/api/sizes/delete/${id}`);
            fetchSizes(); 
            alert("ลบสำเร็จ");
        } catch (err) {
            console.error(err);
            alert("ลบไม่สำเร็จ");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0 rounded-4 p-4">
                <h3 className="fw-bold mb-4">📏 จัดการไซส์สินค้า</h3>

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
                                            <>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleUpdate(s.product_size_id)}>บันทึก</button>
                                                <button className="btn btn-secondary btn-sm me-2" onClick={() => setEditId(null)}>ยกเลิก</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditId(s.product_size_id); setEditName(s.product_size_name); }}>แก้ไข</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.product_size_id)}>ลบ</button>
                                            </>
                                        )}
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