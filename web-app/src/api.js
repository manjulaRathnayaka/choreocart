// Get the API base URL from window.configs, falling back to environment variables,
// then falling back to an empty string (relative URL)
const API_BASE_URL = (window.configs && window.configs.apiUrl) ||
                     import.meta.env.VITE_API_BASE_URL ||
                     '';

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

// Find and update the addToCart function
export async function addToCart(product) {
  try {
    // Add a quantity property if it doesn't exist
    const productToAdd = {
      ...product,
      quantity: product.quantity || 1
    };

    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToAdd),
    });

    if (!res.ok) {
      throw new Error('Failed to add item to cart');
    }

    // Return the updated cart (this is important)
    const updatedCart = await getCart();
    return updatedCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Find and update or add the updateCartItemQuantity function
export async function updateCartItemQuantity(productId, quantity) {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  try {
    console.log(`Updating quantity for product ${productId} to ${quantity}`);

    // First get the current cart
    const currentCart = await getCart();

    // Update the quantity for the specified product
    const updatedCart = currentCart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: quantity };
      }
      return item;
    });

    console.log("Sending updated cart:", updatedCart);

    // Send the updated cart to the server
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCart),
    });

    console.log("Update cart response status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to update cart: ${res.status}`);
    }

    // Return the result of getCart() to ensure we have the latest state
    return await getCart();
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

export async function clearCart() {
  try {
    console.log("Clearing cart at:", `${API_BASE_URL}/cart`);
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
    });

    console.log("Clear cart response status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to clear cart: ${res.status}`);
    }

    console.log("Cart cleared successfully");
    return [];
  } catch (error) {
    console.error("Clear cart error:", error);
    throw error;
  }
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
  try {
    console.log("Fetching orders from:", `${API_BASE_URL}/orders`);
    const res = await fetch(`${API_BASE_URL}/orders`);

    console.log("Orders API response status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status}`);
    }

    const data = await res.json();
    console.log("Orders API response data:", data);
    return data;
  } catch (error) {
    console.error("Orders API fetch error:", error);
    throw error;
  }
}

export async function getOrder(orderId) {
  try {
    console.log(`Fetching order details for ${orderId}`);
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);

    console.log("Get order response status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to fetch order: ${res.status}`);
    }

    const order = await res.json();
    console.log("Order details:", order);
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);

    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    console.log("Update order status response:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to update order status: ${res.status}`);
    }

    const updatedOrder = await res.json();
    console.log("Updated order:", updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}
