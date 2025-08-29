import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      navigate('/login');
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${user.id}`);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await axios.put(`${API_BASE_URL}/cart/${user.id}/items/${productId}`, {
        quantity: newQuantity
      });
      setCart(response.data.cart);
      toast.success('Cart updated');
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/${user.id}/items/${productId}`);
      setCart(response.data.cart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/cart/${user.id}`);
      setCart({ items: [], total: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 50; // Free shipping over $500
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.18; // 18% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal + shipping + tax;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-white text-xl" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Shopping Cart</h1>
            <p className="text-gray-300">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <FiShoppingBag className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-300 mb-8">Looks like you haven't added any products yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <FiTrash2 /> Clear Cart
                </button>
              </div>

              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4"
                >
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product._id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <Link
                      to={`/products/${item.product._id}`}
                      className="block"
                    >
                      <h3 className="text-white font-semibold text-lg hover:text-orange-300 transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 font-bold text-xl">
                        ${item.price}
                      </span>
                      
                      {item.product.stock < item.quantity && (
                        <span className="text-red-400 text-sm">
                          Only {item.product.stock} left in stock
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white/10 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={updating[item.product._id] || item.quantity <= 1}
                          className="p-2 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiMinus className="text-white" />
                        </button>
                        <span className="px-4 py-2 text-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={updating[item.product._id] || item.quantity >= item.product.stock}
                          className="p-2 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiPlus className="text-white" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-white font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          disabled={updating[item.product._id]}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>
                      {calculateShipping() === 0 ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        `$${calculateShipping().toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Tax (18%)</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  
                  <hr className="border-white/20" />
                  
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {calculateShipping() > 0 && (
                  <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      Add ${(500 - calculateSubtotal()).toFixed(2)} more for FREE shipping!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 mb-4"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/products"
                  className="block text-center text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;