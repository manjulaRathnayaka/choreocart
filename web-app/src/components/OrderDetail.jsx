import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api';
import './OrderDetail.css';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await getOrder(id);
        console.log("Order details:", data);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setIsUpdating(true);
      const updatedOrder = await updateOrderStatus(id, "cancelled");
      setOrder(updatedOrder);
      toast.success("Order cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error(`Failed to cancel order: ${err.message || "Unknown error"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail">
        <h2>Order Details</h2>
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail">
        <h2>Order Details</h2>
        <div className="error-message">
          <p>Sorry, we couldn't load the order details</p>
          <p className="error-details">{error}</p>
          <Link to="/orders" className="back-button">Back to Orders</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail">
        <h2>Order Details</h2>
        <p>Order not found</p>
        <Link to="/orders" className="back-button">Back to Orders</Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'pending':
      default: return 'status-pending';
    }
  };

  return (
    <div className="order-detail">
      <div className="order-header">
        <h2>Order Details</h2>
        <Link to="/orders" className="back-button">Back to Orders</Link>
      </div>

      <div className="order-info">
        <div className="order-id">
          <h3>Order #{order.id}</h3>
          <span className={`order-status ${getStatusClass(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="order-dates">
          <div className="date-info">
            <span className="label">Placed on:</span>
            <span className="value">{formatDate(order.createdAt)}</span>
          </div>
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <div className="date-info">
              <span className="label">Last updated:</span>
              <span className="value">{formatDate(order.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="order-items-container">
        <h3>Items</h3>
        <div className="order-items">
          {order.items.map((item, index) => (
            <div className="order-item" key={index}>
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                {item.category && <div className="item-category">{item.category}</div>}
                {item.description && <div className="item-description">{item.description}</div>}
              </div>
              <div className="item-quantity">
                <span className="label">Qty:</span>
                <span className="value">{item.quantity || 1}</span>
              </div>
              <div className="item-price">${item.price.toFixed(2)}</div>
              <div className="item-subtotal">
                <span className="label">Subtotal:</span>
                <span className="value">${((item.price) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-summary">
        <div className="order-total">
          <span className="label">Total:</span>
          <span className="value">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {order.status === 'pending' && (
        <div className="order-actions">
          <button
            className="cancel-order-btn"
            onClick={handleCancelOrder}
            disabled={isUpdating}
          >
            {isUpdating ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;