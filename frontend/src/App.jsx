import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import RoomPage from './pages/RoomPage';
import LoginPage from './pages/LoginPage';
import { account } from './utils/appwrite';
import './App.css';

const UserContext = createContext({ user: null, setUser: () => {} });
export const useUser = () => useContext(UserContext);

const Navigation = () => {
  return (
    <nav className="flex justify-between items-center px-5 py-3 bg-gray-900 shadow-lg">
      <Link className="text-3xl md:text-5xl font-bold text-gray-300 hover:text-orange-500 transition duration-300 cursor-pointer" to="/">
        <span className="text-orange-500">Un</span>Doubt
      </Link>
    </nav>
  );
};

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setUser } = useUser();
  const location = useLocation();

  useEffect(() => {
    account.get().then((user) => {
      setIsAuthenticated(true);
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    });
  }, [setUser]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

const App = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Clear user on logout (listen for navigation to /login)
  useEffect(() => {
    const unlisten = navigate((location) => {
      if (location.pathname === '/login') setUser(null);
    });
    return unlisten;
  }, [navigate]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Navigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/create-room" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
        <Route path="/join-room" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route path="/join-room/:roomId" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route path="/room/:roomId" element={<ProtectedRoute><RoomPage role="participant" /></ProtectedRoute>} />
        <Route path="/host/:roomId" element={<ProtectedRoute><RoomPage role="host" /></ProtectedRoute>} />
      </Routes>
    </UserContext.Provider>
  );
};

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}


