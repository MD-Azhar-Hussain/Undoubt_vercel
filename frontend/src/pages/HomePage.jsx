import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { LuUsersRound } from "react-icons/lu";
import { TiUserAddOutline } from "react-icons/ti";
import { account } from '../utils/appwrite';
import { useUser } from '../App';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  const handleLogout = async () => {
    await account.deleteSession('current');
    setUser(null); // Clear user context
    navigate('/login', { replace: true });
  };

  // Try to use first or middle name, fallback to name or email
  let userName = '';
  if (user) {
    const name = user.name || user.email || '';
    userName = name.split(' ')[1] || name.split(' ')[0] || name;
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex flex-col">
      <div className="flex justify-end p-6">
        <button
          onClick={handleLogout}
          className="px-5 py-2 text-base md:text-lg font-semibold bg-gray-800 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors duration-300"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-col items-center text-center flex-1 justify-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-glow">
          Welcome{userName ? `, ${userName}` : ''} to UnDoubt!
=======
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex flex-col items-center justify-center text-white px-4">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-shadow-glow">
          Welcome to UnDoubt!
>>>>>>> saketh1607/main
        </h1>
        <p className="text-base sm:text-lg md:text-2xl mb-8 sm:mb-10 px-4">
          Create or join a room to start collaborating with others.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center w-full">
          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg md:text-xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center justify-center cursor-pointer min-w-[160px] sm:min-w-[180px]"
          >
            <TiUserAddOutline className="text-lg sm:text-xl"/><span className='ml-1.5'>Create Room</span>
          </button>
          <button
            onClick={handleJoinRoom}
            className="px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg md:text-xl font-semibold bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center justify-center cursor-pointer min-w-[160px] sm:min-w-[180px]"
          >
            <LuUsersRound className="text-lg sm:text-xl"/> <span className='ml-2'>Join Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
