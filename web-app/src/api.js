
export async function getProducts() {
  const res = await fetch('/api/products');
  return res.json();
}

export async function getCart() {
  const res = await fetch('/api/cart');
  return res.json();
}

export async function addToCart(product) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

export async function checkout() {
  const res = await fetch('/api/checkout', { method: 'POST' });
  return res.json();
}
