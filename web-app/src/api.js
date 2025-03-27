export async function getProducts() {
  const res = await fetch('/api/products');
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  return res.json();
}

export async function searchProducts(query, category) {
  let url = '/api/products/search';
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
  const res = await fetch('/api/cart');
  if (!res.ok) {
    throw new Error('Failed to fetch cart');
  }
  return res.json();
}

export async function addToCart(product) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error('Failed to add item to cart');
  }
  return res;
}

export async function clearCart() {
  const res = await fetch('/api/cart', {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to clear cart');
  }
  return res;
}

export async function checkout() {
  const res = await fetch('/api/checkout', { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Checkout failed');
  }
  return res.json();
}

export async function getOrders() {
  const res = await fetch('/api/orders');
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  return res.json();
}

export async function getOrder(orderId) {
  const res = await fetch(`/api/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch order');
  }
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to update order status');
  }
  return res.json();
}
