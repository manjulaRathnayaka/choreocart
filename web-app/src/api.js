// Get the API base URL from environment variables, defaulting to empty string (relative URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function getProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  return res.json();
}

export async function searchProducts(query, category) {
  let url = `${API_BASE_URL}/products/search`;
  const params = [];
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (params.length) url += '?' + params.join('&');

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to search products');
  }
  return res.json();
}

export async function getCart() {
  const res = await fetch(`${API_BASE_URL}/cart`);
  if (!res.ok) {
    throw new Error('Failed to fetch cart');
  }
  return res.json();
}

export async function addToCart(product) {
  // Get the current cart to check if the item already exists
  try {
    const res = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      throw new Error('Failed to add item to cart');
    }
    return res;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Add a new function to update item quantity
export async function updateCartItemQuantity(productId, quantity) {
  try {
    // Get current cart
    const cart = await getCart();
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    const res = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCart),
    });

    if (!res.ok) {
      throw new Error('Failed to update cart');
    }
    return res;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

export async function clearCart() {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to clear cart');
  }
  return res;
}

export async function checkout() {
  const res = await fetch(`${API_BASE_URL}/checkout`, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Checkout failed');
  }
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`);
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  return res.json();
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch order');
  }
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to update order status');
  }
  return res.json();
}
