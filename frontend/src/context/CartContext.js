import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      // ตรวจสอบว่ามีสินค้า id นี้ และ size นี้ในตะกร้าหรือยัง
      const isItemInCart = prevCart.find(
        (item) => item.product_id === product.product_id && item.size === product.size
      );

      if (isItemInCart) {
        return prevCart.map((item) =>
          item.product_id === product.product_id && item.size === product.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // ถ้ายังไม่มี ให้เพิ่มใหม่ 
      return [
        ...prevCart,
        {
          product_id: product.product_id,
          product_name: product.product_name,
          price: product.price,
          product_img: product.product_img, // << หัวใจสำคัญ
          size: product.size || 'S',
          quantity: 1,
        },
      ];
    });
  };

  const increaseQty = (id, size) => {
    setCart(cart.map(item =>
      item.product_id === id && item.size === size
        ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQty = (id, size) => {
    setCart(cart.map(item =>
      item.product_id === id && item.size === size && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const removeItem = (id, size) => {
    setCart(cart.filter(item => !(item.product_id === id && item.size === size)));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, increaseQty, decreaseQty, removeItem, totalPrice, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};