import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCreditCard, FiTruck, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'cod',
    shippingAddress: {
      fullName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phone: ''
    }
  });

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
      
      if (response.data.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validate form
    const { shippingAddress } = formData;
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        userId: user.id,
        userEmail: user.emailAddresses?.[0]?.emailAddress || user.email,
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        paymentMethod: formData.paymentMethod,
        shippingAddress: formData.shippingAddress
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order.orderId}`, { 
        state: { orderCreated: true } 
      });
      
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading checkout...</p>
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
            onClick={() => navigate('/cart')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-white text-xl" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Checkout</h1>
            <p className="text-gray-300">Complete your purchase</p>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Checkout Form */}
            <div className="space-y-6">
              
              {/* Shipping Address */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FiTruck /> Shipping Address
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-white font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="shippingAddress.fullName"
                      value={formData.shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-white font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="shippingAddress.street"
                      value={formData.shippingAddress.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">State *</label>
                    <input
                      type="text"
                      name="shippingAddress.state"
                      value={formData.shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="shippingAddress.zipCode"
                      value={formData.shippingAddress.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="shippingAddress.phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FiCreditCard /> Payment Method
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-white">Cash on Delivery (COD)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-white">Credit/Debit Card (Coming Soon)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-white">UPI Payment (Coming Soon)</span>
                  </label>
                </div>

                <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm flex items-center gap-2">
                    <FiLock /> Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-white text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <span className="text-white font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
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
                  
                  <div className="flex justify-between text-white font-bold text-xl">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={placing || formData.paymentMethod !== 'cod'}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 mb-4"
                >
                  {placing ? 'Placing Order...' : `Place Order - $${calculateTotal().toFixed(2)}`}
                </button>

                <p className="text-gray-400 text-xs text-center">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;