import React, { useState } from 'react';
import './Cart.css';
import { updateCartItemQuantity, clearCart } from '../api';
import { toast } from 'react-toastify';

const Cart = ({ cart, checkout, fetchCart }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const totalAmount = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    return sum + (item.price * quantity);
  }, 0);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1

    setIsUpdating(true);
    try {
      await updateCartItemQuantity(productId, newQuantity);
      // Always call fetchCart to update the cart in the parent component
      fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error(`Failed to update quantity: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      // Call fetchCart to update the cart in the parent component
      fetchCart();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error(`Failed to clear cart: ${error.message || 'Unknown error'}`);
    } finally {
      setIsClearing(false);
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
                    disabled={(item.quantity || 1) <= 1 || isUpdating}
                  >
                    -
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    disabled={isUpdating}
                  >
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
            <button
              className="checkout-btn"
              onClick={checkout}
              disabled={isUpdating || isClearing}
            >
              Checkout
            </button>
            <button
              className="clear-cart-btn"
              onClick={handleClearCart}
              disabled={isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;