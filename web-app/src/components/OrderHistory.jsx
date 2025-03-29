import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api';
import './OrderHistory.css';
import { toast } from 'react-toastify';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      console.log("Orders data in component:", data);
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load order history');
      toast.error(`Error: ${err.message || 'Failed to load order history'}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("OrderHistory component mounted, fetching orders...");
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="order-history">
        <h2>Order History</h2>
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history">
        <h2>Order History</h2>
        <div className="error-message">
          <p>Sorry, we couldn't load your orders</p>
          <p className="error-details">{error}</p>
          <button className="retry-button" onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="start-shopping-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-date">
                Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span className="item-name">{item.name} × {item.quantity || 1}</span>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
              </div>
              <Link to={`/orders/${order.id}`} className="view-order-btn">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;