import React, { useState, useEffect } from 'react';
import { getOrders } from '../api';
import './OrderHistory.css';
import { toast } from 'react-toastify';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load order history');
      toast.error(`Error: ${err.message || 'Failed to load order history'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="order-history loading-state">
      <div className="loading">Loading your orders...</div>
    </div>
  );

  if (error) return (
    <div className="order-history error-state">
      <h2>Order History</h2>
      <div className="error-message">
        <p>Sorry, we couldn't load your orders</p>
        <p className="error-details">{error}</p>
        <button className="retry-button" onClick={fetchOrders}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="order-history">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span className={`order-status status-${order.status}`}>{order.status}</span>
              </div>
              <div className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;