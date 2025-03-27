const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Service URLs - in a production environment, these would come from environment variables
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const CART_SERVICE = process.env.CART_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Error handling middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

// Products API
app.get('/api/products', asyncHandler(async (req, res) => {
  const response = await fetch(`${PRODUCT_SERVICE}/products`);
  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch products' });
  }
  const products = await response.json();
  res.json(products);
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const response = await fetch(`${PRODUCT_SERVICE}/products/${req.params.id}`);
  if (!response.ok) {
    return res.status(response.status).json({ error: 'Product not found' });
  }
  const product = await response.json();
  res.json(product);
}));

app.get('/api/products/search', asyncHandler(async (req, res) => {
  const { query, category } = req.query;
  let url = `${PRODUCT_SERVICE}/products/search`;

  // Add query parameters if provided
  const params = [];
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (params.length) url += '?' + params.join('&');

  const response = await fetch(url);
  if (!response.ok) {
    return res.status(response.status).json({ error: 'Search failed' });
  }
  const products = await response.json();
  res.json(products);
}));

// Cart API
app.get('/api/cart', asyncHandler(async (req, res) => {
  const response = await fetch(`${CART_SERVICE}/cart`);
  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch cart' });
  }
  const cart = await response.json();
  res.json(cart);
}));

app.post('/api/cart', asyncHandler(async (req, res) => {
  const response = await fetch(`${CART_SERVICE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(response.status).json({ error: error || 'Failed to add item to cart' });
  }

  res.status(response.status).end();
}));

app.delete('/api/cart', asyncHandler(async (req, res) => {
  const response = await fetch(`${CART_SERVICE}/cart`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to clear cart' });
  }

  res.status(response.status).end();
}));

// Checkout/Order API
app.post('/api/checkout', asyncHandler(async (req, res) => {
  // First get the cart contents
  const cartResponse = await fetch(`${CART_SERVICE}/cart`);
  if (!cartResponse.ok) {
    return res.status(cartResponse.status).json({ error: 'Failed to fetch cart' });
  }

  const cartItems = await cartResponse.json();
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cannot checkout empty cart' });
  }

  // Create the order with the cart items
  const orderResponse = await fetch(`${ORDER_SERVICE}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cartItems),
  });

  if (!orderResponse.ok) {
    return res.status(orderResponse.status).json({ error: 'Failed to create order' });
  }

  const order = await orderResponse.json();

  // Clear the cart after successful order
  await fetch(`${CART_SERVICE}/cart`, { method: 'DELETE' });

  res.status(201).json(order);
}));

app.get('/api/orders', asyncHandler(async (req, res) => {
  const response = await fetch(`${ORDER_SERVICE}/orders`);
  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch orders' });
  }
  const orders = await response.json();
  res.json(orders);
}));

app.get('/api/orders/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const response = await fetch(`${ORDER_SERVICE}/orders/${orderId}`);

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Order not found' });
  }

  const order = await response.json();
  res.json(order);
}));

// Update order status
app.patch('/api/orders/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const response = await fetch(`${ORDER_SERVICE}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to update order status' });
  }

  const order = await response.json();
  res.json(order);
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BFF API running on port ${PORT}`));
