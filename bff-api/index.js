const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Service URLs - in a production environment, these would come from environment variables
// Remove any trailing slashes when assigning
const PRODUCT_SERVICE = (process.env.CHOREO_PRODUCT_SERVICEURL || 'http://localhost:3001').replace(/\/$/, '');
const CART_SERVICE = (process.env.CHOREO_CART_SERVICEURL || 'http://localhost:3002').replace(/\/$/, '');
const ORDER_SERVICE = (process.env.CHOREO_ORDER_SERVICEURL || 'http://localhost:3003').replace(/\/$/, '');
const CHOREO_PRODUCT_API_KEY = process.env.CHOREO_PRODUCT_CHOREOAPIKEY;
const CHOREO_ORDER_API_KEY = process.env.CHOREO_ORDER_CHOREOAPIKEY;
const CHOREO_CART_API_KEY = process.env.CHOREO_CART_APIKEY;

// Function to create headers with API keys based on the service being called
const createHeaders = (service, additionalHeaders = {}) => {
  const headers = { ...additionalHeaders };

  // Add the appropriate Choreo API Key based on which service we're calling
  if (service === 'product' && CHOREO_PRODUCT_API_KEY) {
    headers['Choreo-API-Key'] = CHOREO_PRODUCT_API_KEY;
  } else if (service === 'cart' && CHOREO_CART_API_KEY) {
    headers['Choreo-API-Key'] = CHOREO_CART_API_KEY;
  } else if (service === 'order' && CHOREO_ORDER_API_KEY) {
    headers['Choreo-API-Key'] = CHOREO_ORDER_API_KEY;
  }

  return headers;
};

// Error handling middleware
const asyncHandler = fn => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

// Products API
app.get('/products', asyncHandler(async (req, res) => {
  const response = await fetch(`${PRODUCT_SERVICE}/products`, {
    headers: createHeaders('product')
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch products' });
  }
  const products = await response.json();
  res.json(products);
}));

app.get('/products/:id', asyncHandler(async (req, res) => {
  const response = await fetch(`${PRODUCT_SERVICE}/products/${req.params.id}`, {
    headers: createHeaders('product')
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Product not found' });
  }
  const product = await response.json();
  res.json(product);
}));

app.get('/products/search', asyncHandler(async (req, res) => {
  const { query, category } = req.query;
  let url = `${PRODUCT_SERVICE}/products/search`;

  // Add query parameters if provided
  const params = [];
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (params.length) url += '?' + params.join('&');

  const response = await fetch(url, {
    headers: createHeaders('product')
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Search failed' });
  }
  const products = await response.json();
  res.json(products);
}));

// Cart API
app.get('/cart', asyncHandler(async (req, res) => {
  const response = await fetch(`${CART_SERVICE}/cart`, {
    headers: createHeaders('cart')
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch cart' });
  }
  const cart = await response.json();
  res.json(cart);
}));

// Update the POST /cart endpoint - find this in your code and replace it
app.post('/cart', asyncHandler(async (req, res) => {
  const product = req.body;

  // Validate the product
  if (!product.id || !product.name || product.price === undefined) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  // Add quantity=1 if not provided
  if (!product.quantity) {
    product.quantity = 1;
  }

  // Forward to cart service
  const response = await fetch(`${CART_SERVICE}/cart`, {
    method: 'POST',
    headers: createHeaders('cart', { 'Content-Type': 'application/json' }),
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(response.status).json({ error: error || 'Failed to add item to cart' });
  }

  res.status(201).end();
}));

// Make sure the PUT /cart endpoint is properly handling the request
app.put('/api/cart', asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid cart data format' });
  }

  try {
    const response = await fetch(`${CART_SERVICE}/cart`, {
      method: 'PUT',
      headers: createHeaders('cart', { 'Content-Type': 'application/json' }),
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: error || 'Failed to update cart' });
    }

    // Get the updated cart to return
    const updatedCartResponse = await fetch(`${CART_SERVICE}/cart`, {
      headers: createHeaders('cart')
    });

    if (!updatedCartResponse.ok) {
      return res.status(200).json({ message: 'Cart updated successfully' });
    }

    const updatedCart = await updatedCartResponse.json();
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
}));

// Add this route too, without the /api prefix for compatibility
app.put('/cart', asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid cart data format' });
  }

  try {
    const response = await fetch(`${CART_SERVICE}/cart`, {
      method: 'PUT',
      headers: createHeaders('cart', { 'Content-Type': 'application/json' }),
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: error || 'Failed to update cart' });
    }

    // Get the updated cart to return
    const updatedCartResponse = await fetch(`${CART_SERVICE}/cart`, {
      headers: createHeaders('cart')
    });

    if (!updatedCartResponse.ok) {
      return res.status(200).json({ message: 'Cart updated successfully' });
    }

    const updatedCart = await updatedCartResponse.json();
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
}));

app.delete('/cart', asyncHandler(async (req, res) => {
  const response = await fetch(`${CART_SERVICE}/cart`, {
    method: 'DELETE',
    headers: createHeaders('cart')
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to clear cart' });
  }

  res.status(response.status).end();
}));

// Checkout/Order API
app.post('/checkout', asyncHandler(async (req, res) => {
  // First get the cart contents
  const cartResponse = await fetch(`${CART_SERVICE}/cart`, {
    headers: createHeaders('cart')
  });

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
    headers: createHeaders('order', { 'Content-Type': 'application/json' }),
    body: JSON.stringify(cartItems),
  });

  if (!orderResponse.ok) {
    return res.status(orderResponse.status).json({ error: 'Failed to create order' });
  }

  const order = await orderResponse.json();

  // Clear the cart after successful order
  await fetch(`${CART_SERVICE}/cart`, {
    method: 'DELETE',
    headers: createHeaders('cart')
  });

  res.status(201).json(order);
}));

app.get('/orders', asyncHandler(async (req, res) => {
  const response = await fetch(`${ORDER_SERVICE}/orders`, {
    headers: createHeaders('order')
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch orders' });
  }
  const orders = await response.json();
  res.json(orders);
}));

app.get('/orders/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    console.log(`Fetching order ${orderId} from ${ORDER_SERVICE}/orders/${orderId}`);
    const response = await fetch(`${ORDER_SERVICE}/orders/${orderId}`, {
      headers: createHeaders('order')
    });

    console.log("Order service response status:", response.status);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Order not found' });
    }

    const order = await response.json();
    console.log("Order data:", order);
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}));

// Update order status
app.patch('/orders/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    const response = await fetch(`${ORDER_SERVICE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: createHeaders('order', { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });

    console.log("Update order status response:", response.status);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to update order status' });
    }

    const order = await response.json();
    console.log("Updated order:", order);
    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`BFF API running on port ${PORT}`);
  console.log(`Using Product Service: ${PRODUCT_SERVICE}`);
  console.log(`Using Cart Service: ${CART_SERVICE}`);
  console.log(`Using Order Service: ${ORDER_SERVICE}`);
});
