
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const PRODUCT_SERVICE = 'http://localhost:3001';
const CART_SERVICE = 'http://localhost:3002';
const ORDER_SERVICE = 'http://localhost:3003';

app.get('/api/products', async (req, res) => {
  const r = await fetch(PRODUCT_SERVICE + '/products');
  res.json(await r.json());
});

app.get('/api/cart', async (req, res) => {
  const r = await fetch(CART_SERVICE + '/cart');
  res.json(await r.json());
});

app.post('/api/cart', async (req, res) => {
  const r = await fetch(CART_SERVICE + '/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });
  res.status(r.status).end();
});

app.post('/api/checkout', async (req, res) => {
  const r = await fetch(ORDER_SERVICE + '/order', { method: 'POST' });
  res.json(await r.json());
});

app.listen(3000, () => console.log('BFF API running on port 3000'));
