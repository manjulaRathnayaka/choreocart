
import { useEffect, useState } from 'react';
import { getProducts, getCart, addToCart, checkout } from './api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
    getCart().then(setCart);
  }, []);

  const handleAdd = async (product) => {
    await addToCart(product);
    setCart(await getCart());
  };

  const handleCheckout = async () => {
    const confirmation = await checkout();
    alert(confirmation.message);
    setCart([]);
  };

  return (
    <div>
      <h1>ChoreoCart</h1>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
            <button onClick={() => handleAdd(p)}>Add to cart</button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      <ul>
        {cart.map((item, i) => (
          <li key={i}>{item.name} - ${item.price}</li>
        ))}
      </ul>
      {cart.length > 0 && <button onClick={handleCheckout}>Checkout</button>}
    </div>
  );
}
