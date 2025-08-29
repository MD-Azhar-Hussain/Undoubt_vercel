import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { logOut } from './config/firebase';
import ProtectedRoute, { HostProtectedRoute, ParticipantProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import RoomPage from './pages/RoomPage';
import LoginPage from './pages/LoginPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { account } from './utils/appwrite';
import AccessDeniedPage from './pages/AccessDeniedPage';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import axios from 'axios';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const UserContext = createContext({ user: null, setUser: () => {} });
export const useUser = () => useContext(UserContext);

const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartCount();
    }
  }, [isAuthenticated, user]);

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${user.id}`);
      setCartCount(response.data.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Successfully logged out!');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              ShopSphere
            </span>
          </Link>

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
            <Link to="/products" className="text-white hover:text-orange-300 transition-colors">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/cart" 
                  className="text-white hover:text-orange-300 transition-colors relative"
                >
                  <FiShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-2">
                  <FiUser className="text-white" />
                  <span className="text-white text-sm">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 rounded transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 rounded transition duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
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

            <div className="space-y-2">
              <Link 
                to="/products" 
                className="block text-white hover:text-orange-300 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/cart" 
                    className="flex items-center text-white hover:text-orange-300 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShoppingCart className="mr-2" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  <div className="flex items-center py-2 text-white">
                    <FiUser className="mr-2" />
                    {user.displayName?.split(' ')[0] || 'User'}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-white hover:text-red-300 transition-colors py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-white hover:text-blue-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes isAuthenticated={isAuthenticated} />
    </Router>
  );
};

const AppRoutes = ({ isAuthenticated }) => {
  const location = useLocation();
  
  // Check if current route is a room route (keeping old functionality for backward compatibility)
  const isRoomRoute = location.pathname.startsWith('/room/') || location.pathname.startsWith('/host/');

  return (
    <>
      {isAuthenticated && !isRoomRoute && <Navigation />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Main eCommerce Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute><HomePage /></ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/products"
          element={<ProductCatalogPage />}
        />
        <Route
          path="/products/:id"
          element={<ProductDetailPage />}
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute><CartPage /></ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          }
        />

        {/* Legacy Room Routes (keeping for backward compatibility) */}
        <Route
          path="/create-room"
          element={
            <ProtectedRoute><CreateRoomPage /></ProtectedRoute>
          }
        />
        <Route
          path="/join-room"
          element={
            <ProtectedRoute><JoinRoomPage /></ProtectedRoute>
          }
        />
        <Route
          path="/join-room/:roomId"
          element={
            <ProtectedRoute><JoinRoomPage /></ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ParticipantProtectedRoute><RoomPage role="participant" /></ParticipantProtectedRoute>
          }
        />
        <Route
          path="/host/:roomId"
          element={
            <HostProtectedRoute><RoomPage role="host" /></HostProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;


