import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductType = () => {
    const [types, setTypes] = useState([]);
    const [typeName, setTypeName] = useState(''); 
    const [isEditing, setIsEditing] = useState(false); 
    const [currentId, setCurrentId] = useState(null); 

    // 1. ดึงข้อมูลจาก Backend
    const fetchTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/product-types');
            setTypes(res.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // 2. ฟังก์ชันเตรียมแก้ไข
    const handleEditClick = (item) => {
        setIsEditing(true);
        setCurrentId(item.product_type_id);
        setTypeName(item.product_type_name);
    };

    // 3. ฟังก์ชันยกเลิกการแก้ไข
    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentId(null);
        setTypeName('');
    };

    // 4. ฟังก์ชันส่งข้อมูล (Handle Submit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // แก้ไข: ใช้ backticks (`) สำหรับ URL ที่มีตัวแปร
                await axios.put(`http://localhost:5000/api/product-types/update/${currentId}`, {
                    product_type_name: typeName
                });
                alert("อัปเดตสำเร็จ!");
            } else {
                await axios.post('http://localhost:5000/api/product-types/add', {
                    product_type_name: typeName
                });
                alert("เพิ่มข้อมูลสำเร็จ!");
            }
            
            handleCancelEdit(); 
            fetchTypes(); 

        } catch (err) {
            alert("ทำรายการไม่สำเร็จ");
            console.error(err);
        }
    };

    // 5. ฟังก์ชันลบข้อมูล
    const handleDelete = async (id) => {
        if (window.confirm("คุณต้องการลบประเภทสินค้านี้ใช่หรือไม่?")) {
            try {
                // แก้ไข: ใช้ backticks (`) สำหรับ URL ที่มีตัวแปร
                await axios.delete(`http://localhost:5000/api/product-types/delete/${id}`);
                fetchTypes();
            } catch (err) {
                alert("ลบข้อมูลไม่สำเร็จ");
            }
        }
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-3">📊 จัดการประเภทสินค้า</h4>
            
            <table className="table table-bordered table-striped mt-3 shadow-sm bg-white">
                <thead className="table-dark text-center">
                    <tr>
                        <th>ID</th>
                        <th>ชื่อประเภทสินค้า</th>
                        <th>จำนวนสินค้า </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {types.map((item) => (
                        <tr key={item.product_type_id} className="text-center align-middle">
                            <td>{item.product_type_id}</td>
                            <td>{item.product_type_name}</td>
                            <td>{item.product_count || 0}</td>
                            <td>
                                <button 
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => handleEditClick(item)}
                                > แก้ไข </button>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(item.product_type_id)}
                                > ลบ </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={`card mt-4 p-4 shadow-sm ${isEditing ? 'border-warning' : 'border-success'}`}>
                {/* แก้ไข: ใส่ปีกกา {} ครอบเงื่อนไข JavaScript */}
                <h5>{isEditing ? `แก้ไขประเภทสินค้า (ID: ${currentId})` : 'เพิ่มประเภทสินค้าใหม่'}</h5>
                <form onSubmit={handleSubmit} className="row g-3 mt-1">
                    <div className="col-md-6">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="ระบุชื่อประเภทสินค้า ตัวอย่าง: เสื้ออื่น ๆ "
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="col-auto">
                        <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}>
                            {isEditing ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
                        </button>
                        {isEditing && (
                            <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                                ยกเลิก
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductType;