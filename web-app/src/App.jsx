import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderHistory from './components/OrderHistory';
import OrderDetail from './components/OrderDetail';
import { getProducts, getCart, addToCart as apiAddToCart, checkout as apiCheckout } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      toast.error(`Error: ${err.message || 'Failed to load products'}`);
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      console.log("Fetching cart...");
      setCartLoading(true);
      const cartData = await getCart();
      console.log("Cart data received:", cartData);
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setCartLoading(false);
    }
  };

  const refreshCart = () => {
    fetchCart();
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      const updatedCart = await apiAddToCart(product);
      setCart(updatedCart); // Update the cart with the returned data
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(`Failed to add item: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCheckout = async () => {
    try {
      await apiCheckout();
      toast.success('Order placed successfully!');
      refreshCart(); // Use the dedicated refresh function
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error(`Checkout failed: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) return (
    <div className="app loading-container">
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading CloudMart...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="app error-container">
      <div className="error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="retry-button" onClick={fetchProducts}>
          Try Again
        </button>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>CloudMart</h1>
          <nav className="app-nav">
            <Link to="/">Shop</Link>
            <Link to="/orders">Orders</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            <main className="app-main">
              <ProductList products={products} addToCart={handleAddToCart} />
              <Cart cart={cart} checkout={handleCheckout} fetchCart={refreshCart} />
            </main>
          } />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Routes>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </Router>
  );
}

export default App;
