import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom'; // รวม import ไว้ด้วยกัน
import axios from 'axios';
import '../App.css';
import { CartContext } from "../context/CartContext";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/${id}`);
                const data = Array.isArray(res.data) ? res.data[0] : res.data;

                setProduct(data);

                if (data && data.product_img) {
                    setMainImage(data.product_img);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            }
        };
        fetchProduct();
    }, [id]);

    if (!product) return <div className="container mt-5 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="product-page-bg">
            <div className="container py-5">
                {/* เพิ่ม position-relative เพื่อให้ปุ่ม Back ลอยอยู่มุมขวาของกล่องนี้ได้ */}
                <div className="row bg-white rounded-4 overflow-hidden shadow-lg position-relative">

                    {/* --- ปุ่ม Back มุมขวาบน --- */}
                    <Link to="/User" className="btn-back-detail">
                        <span>&larr;</span> Back
                    </Link>

                    {/* ฝั่งซ้าย: รูปภาพ */}
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

                    {/* ฝั่งขวา: ข้อมูล */}
                    <div className="col-md-5 p-5 d-flex flex-column justify-content-center">
                        <span className="badge bg-gold text-dark mb-2 w-25">NEW ARRIVAL</span>
                        <h2 className="product-title">{product.product_name}</h2>
                        <h3 className="price-tag">฿{Number(product.price).toLocaleString()}</h3>

                        <div className="size-section mt-4">
                            <p className="fw-bold text-secondary">SELECT SIZE</p>
                            <div className="d-flex gap-2">
                                {['S', 'M', 'L', 'XL', '2XL'].map(size => (
                                    <button
                                        key={size}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
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
                                    product_img: product.product_img, // ✅ ส่งชื่อรูปไป
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