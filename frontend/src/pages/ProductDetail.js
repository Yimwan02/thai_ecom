import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import { CartContext } from "../context/CartContext";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [availableSizes, setAvailableSizes] = useState([]); // ✅ เพิ่ม State เก็บไซส์จาก DB
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // 1. ดึงรายละเอียดสินค้า
                const resProduct = await axios.get(`http://localhost:5000/api/products/${id}`);
                const data = Array.isArray(resProduct.data) ? resProduct.data[0] : resProduct.data;
                setProduct(data);
                if (data && data.product_img) setMainImage(data.product_img);

                // 2. ✅ ดึงไซส์ทั้งหมดจาก Database (ตัวที่ Artty แก้ใน Admin)
                const resSizes = await axios.get("http://localhost:5000/api/sizes");
                setAvailableSizes(resSizes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchProductData();
    }, [id]);

    if (!product) return <div className="container mt-5 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="product-page-bg">
            <div className="container py-5">
                <div className="row bg-white rounded-4 overflow-hidden shadow-lg position-relative">
                    <Link to="/user" className="btn-back-detail">
                        <span>&larr;</span> Back
                    </Link>

                    <div className="col-md-7 p-4 d-flex flex-column align-items-center bg-light">
                        <div className="main-img-box">
                            <img
                                src={`http://localhost:5000/images/${mainImage}`}
                                className="img-fluid"
                                alt={product.product_name}
                                style={{ maxHeight: '450px', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <div className="col-md-5 p-5 d-flex flex-column justify-content-center">
                        <span className="badge bg-gold text-dark mb-2 w-25">NEW ARRIVAL</span>
                        <h2 className="product-title">{product.product_name}</h2>
                        <h3 className="price-tag">฿{Number(product.price).toLocaleString()}</h3>

                        <div className="size-section mt-4">
                            <p className="fw-bold text-secondary">SELECT SIZE</p>
                            <div className="d-flex gap-2 flex-wrap">
                                {/* ✅ เปลี่ยนจาก Hardcode เป็นการ Map จาก Database */}
                                {availableSizes.map((s) => (
                                    <button
                                        key={s.product_size_id}
                                        className={`size-btn ${selectedSize === s.product_size_name ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(s.product_size_name)}
                                    >
                                        {s.product_size_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn-buy-now mt-5"
                            onClick={() => {
                                if (!selectedSize) {
                                    alert("กรุณาเลือกไซส์ก่อน");
                                    return;
                                }
                                addToCart({
                                    product_id: product.product_id,
                                    product_name: product.product_name,
                                    price: product.price,
                                    product_img: product.product_img,
                                    size: selectedSize
                                });
                                alert("เพิ่มลงตะกร้าสำเร็จ 🎉");
                            }}
                        >
                            ADD TO CART
                        </button>

                        <p className="product-desc-text mt-4">
                            {product.product_detail || "สัมผัสประสบการณ์ความนุ่มสบายด้วยเนื้อผ้าเกรดพรีเมียม ระบายอากาศได้ดีเยี่ยม พร้อมดีไซน์ลิขสิทธิ์แท้"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;