import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiHeart, FiArrowRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import './HomePage.css';

const DemoHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const categories = [
    {
      _id: '1',
      name: 'Electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'
    },
    {
      _id: '2', 
      name: 'Clothing',
      description: 'Fashion and apparel for everyone',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'
    },
    {
      _id: '3',
      name: 'Books',
      description: 'Educational and entertaining books', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
    },
    {
      _id: '4',
      name: 'Home & Garden',
      description: 'Everything for your home and garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
    }
  ];

  const featuredProducts = [
    {
      _id: '1',
      name: 'Smartphone Pro Max',
      price: 799.99,
      rating: 4.8,
      reviewCount: 245,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
      stock: 50
    },
    {
      _id: '2',
      name: 'Wireless Headphones',
      price: 299.99,
      rating: 4.6,
      reviewCount: 189,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      stock: 75
    },
    {
      _id: '3',
      name: 'Designer Jeans',
      price: 89.99,
      rating: 4.7,
      reviewCount: 298,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
      stock: 120
    },
    {
      _id: '4',
      name: 'Gaming Laptop',
      price: 1299.99,
      rating: 4.9,
      reviewCount: 156,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      stock: 25
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Search for: ${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                ShopSphere
              </span>
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-white hover:text-orange-300 transition-colors cursor-pointer">
                Products
              </span>
              <div className="text-white hover:text-orange-300 transition-colors relative cursor-pointer">
                <FiShoppingCart className="text-xl" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <span className="text-white text-sm">Welcome, User!</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:py-20">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-shadow-glow">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              ShopSphere
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl mb-8 sm:mb-10 px-4">
            Discover amazing products at unbeatable prices
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full px-6 py-4 pl-12 text-lg rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 text-xl" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-2 rounded-full transition-all duration-300"
              >
                Search
              </button>
            </div>
          </form>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center w-full">
            <button className="px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg md:text-xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center justify-center cursor-pointer min-w-[160px] sm:min-w-[180px]">
              <FiShoppingCart className="text-lg sm:text-xl"/><span className='ml-1.5'>Shop Now</span>
            </button>
            <button className="px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg md:text-xl font-semibold bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center justify-center cursor-pointer min-w-[160px] sm:min-w-[180px]">
              <FiArrowRight className="text-lg sm:text-xl"/> <span className='ml-2'>Browse Products</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-8 h-8 object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="text-white text-xl">
                    📦
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg group-hover:text-orange-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-300 text-sm mt-2 line-clamp-2">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Featured Products
            </h2>
            <span className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-2 transition-colors cursor-pointer">
              View All <FiArrowRight />
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
                    <FiHeart className="text-white" />
                  </button>
                  {product.stock < 30 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Low Stock
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-xs ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-300 text-sm">
                      ({product.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-400">
                      ${product.price}
                    </span>
                    <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2">
                      <FiShoppingCart /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Free Shipping</h3>
              <p className="text-gray-300">Free shipping on orders over $500</p>
            </div>
            
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Secure Payment</h3>
              <p className="text-gray-300">100% secure payment processing</p>
            </div>
            
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-2xl">🎧</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">24/7 Support</h3>
              <p className="text-gray-300">Customer support around the clock</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoHomePage;