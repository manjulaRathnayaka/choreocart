import React from 'react';
import './Cart.css';
import { updateCartItemQuantity, clearCart } from '../api';

const Cart = ({ cart, checkout, setCart }) => {
  const totalAmount = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    return sum + (item.price * quantity);
  }, 0);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1

    try {
      await updateCartItemQuantity(productId, newQuantity);
      // Update the local cart state
      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">${item.price.toFixed(2)}</div>
                </div>
                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                    disabled={(item.quantity || 1) <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}>
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="cart-actions">
            <button className="checkout-btn" onClick={checkout}>
              Checkout
            </button>
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;