import React from 'react';
import './Cart.css';

const Cart = ({ cart, checkout }) => {
  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div className="cart-item" key={index}>
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="cart-total">
            <strong>Total:</strong> ${totalPrice.toFixed(2)}
          </div>
          <button className="checkout-button" onClick={checkout}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;