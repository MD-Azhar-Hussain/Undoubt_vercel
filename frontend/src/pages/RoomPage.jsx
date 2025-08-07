import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import socket from '../utils/socket';
import QRCode from 'react-qr-code';
import { FaCopy, FaEye, FaEyeSlash, FaCheck, FaThumbsUp, FaQuestionCircle, FaCheckCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import stringSimilarity from 'string-similarity';
import { createRoom, submitDoubt, getDoubts } from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const RoomPage = ({ role }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState('');
  const [similarity, setSimilarity] = useState(0);
  const [upvotedDoubts, setUpvotedDoubts] = useState(new Set(JSON.parse(localStorage.getItem('upvotedDoubts') || '[]')));
  const [visibleEmails, setVisibleEmails] = useState(new Set());
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [roomClosureMessage, setRoomClosureMessage] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'answered'
  const [showQRCode, setShowQRCode] = useState(true);

  useEffect(() => {
    socket.emit('joinRoom', roomId, role);

    socket.on('existingDoubts', (existingDoubts) => {
      setDoubts(existingDoubts);
      const upvoted = new Set(existingDoubts.filter(d => d.upvotedBy.includes(user.id)).map(d => d.id));
      setUpvotedDoubts(upvoted);
    });

    socket.on('newDoubt', (doubt) => {
      setDoubts((prevDoubts) => [...prevDoubts, doubt]);
      toast.info(`New Doubt: ${doubt.text}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: '#AA60C8' }
      });
    });

    socket.on('upvoteDoubt', (doubtId) => {
      setDoubts((prevDoubts) =>
        prevDoubts.map((doubt) =>
          doubt.id === doubtId ? { ...doubt, upvotes: doubt.upvotes + 1 } : doubt
        )
      );
    });

    socket.on('downvoteDoubt', (doubtId) => {
      setDoubts((prevDoubts) =>
        prevDoubts.map((doubt) =>
          doubt.id === doubtId ? { ...doubt, upvotes: doubt.upvotes - 1 } : doubt
        )
      );
    });

    socket.on('markAsAnswered', (doubtId, answered) => {
      setDoubts((prevDoubts) =>
        prevDoubts.map((doubt) =>
          doubt.id === doubtId ? { ...doubt, answered } : doubt
        )
      );
      toast.success('Doubt marked as answered!', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    });

    socket.on('roomClosed', () => {
      setIsRoomClosed(true);
      setRoomClosureMessage('The room was closed, kindly leave the room');
      toast.error('Room was closed, kindly leave the room');
    });

    return () => {
      socket.off('existingDoubts');
      socket.off('newDoubt');
      socket.off('upvoteDoubt');
      socket.off('downvoteDoubt');
      socket.off('markAsAnswered');
      socket.off('roomClosed');
    };
  }, [roomId, role, user.id, navigate]);

  useEffect(() => {
    const fetchDoubts = async () => {
      const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}/doubts`);
      setDoubts(response.data);
    };

    fetchDoubts();
  }, [roomId]);

  const handleAddDoubt = () => {
    if (newDoubt.trim() === '') {
      toast.error('Doubt cannot be empty');
      return;
    }

    const doubt = {
      id: Math.random().toString(36).substring(2, 15),
      text: newDoubt,
      user: user.emailAddresses[0].emailAddress,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      answered: false,
    };
    socket.emit('newDoubt', roomId, doubt);
    setNewDoubt('');
    setSimilarity(0);
    toast.success('Doubt submitted successfully!', {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  };

  const handleToggleUpvote = (id) => {
    if (upvotedDoubts.has(id)) {
      socket.emit('downvoteDoubt', roomId, id, user.id);
      setUpvotedDoubts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        localStorage.setItem('upvotedDoubts', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
    } else {
      socket.emit('upvoteDoubt', roomId, id, user.id);
      setUpvotedDoubts((prev) => {
        const newSet = new Set(prev).add(id);
        localStorage.setItem('upvotedDoubts', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
    }
  };

  const handleToggleEmailVisibility = (id) => {
    setVisibleEmails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleMarkAsAnswered = (id) => {
    socket.emit('markAsAnswered', roomId, id);
  };

  const handleCopyRoomId = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(roomId).then(() => {
        toast.success('Room ID copied to clipboard!');
      }).catch((err) => {
        toast.error('Failed to copy Room ID');
        console.error('Failed to copy Room ID:', err);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Room ID copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy Room ID');
        console.error('Failed to copy Room ID:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCloseRoom = async () => {
    await axios.delete(`${API_BASE_URL}/rooms/${roomId}`);
    socket.emit('closeRoom', roomId);
    navigate('/');
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  const handleDoubtChange = (e) => {
    const newDoubtText = e.target.value;
    setNewDoubt(newDoubtText);

    if (newDoubtText.trim() === '') {
      setSimilarity(0);
      return;
    }

    const existingDoubtTexts = doubts
      .filter(doubt => doubt && doubt.text && typeof doubt.text === 'string')
      .map(doubt => doubt.text);

    if (existingDoubtTexts.length === 0) {
      setSimilarity(0);
      return;
    }

    const bestMatch = stringSimilarity.findBestMatch(newDoubtText, existingDoubtTexts);
    setSimilarity(bestMatch.bestMatch.rating * 100);
  };

  const toggleQRCode = () => {
    setShowQRCode((prev) => !prev);
  };

  // Download doubts/questions as a text file
  const handleDownloadDoubts = () => {
    if (!doubts || doubts.length === 0) {
      toast.info('No doubts to download.');
      return;
    }
    const lines = doubts.map((d, idx) => `${idx + 1}. ${d.text} [${d.answered ? 'Answered' : 'Active'}]`);
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room_${roomId}_doubts.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Separate active and answered doubts
  const activeDoubts = doubts.filter(doubt => !doubt.answered);
  const answeredDoubts = doubts.filter(doubt => doubt.answered);

  // Sort doubts by upvotes and then by creation time
  const sortedActiveDoubts = activeDoubts.sort((a, b) => {
    if (b.upvotes === a.upvotes) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return b.upvotes - a.upvotes;
  });

  const sortedAnsweredDoubts = answeredDoubts.sort((a, b) => {
    if (b.upvotes === a.upvotes) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return b.upvotes - a.upvotes;
  });

  const DoubtCard = ({ doubt, isAnswered = false }) => (
    <div
      className={`relative p-4 mb-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
        isAnswered 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
          : 'bg-white border-2 border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-3">
          <p className={`text-lg font-medium mb-2 ${isAnswered ? 'text-green-800' : 'text-gray-800'}`}>
            {doubt.text}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-semibold ${isAnswered ? 'text-green-600' : 'text-blue-600'}`}>
                {doubt.upvotes} upvotes
              </span>
              {isAnswered && (
                <span className="text-sm text-green-600 font-semibold flex items-center">
                  <FaCheckCircle className="mr-1" />
                  Answered
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {role === 'host' && (
                <>
                  <button
                    onClick={() => handleToggleEmailVisibility(doubt.id)}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title={visibleEmails.has(doubt.id) ? 'Hide email' : 'Show email'}
                  >
                    {visibleEmails.has(doubt.id) ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {visibleEmails.has(doubt.id) && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {doubt.user}
                    </span>
                  )}
                  {!isAnswered && (
                    <button
                      onClick={() => handleMarkAsAnswered(doubt.id)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Mark as answered"
                    >
                      <FaCheck />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => handleToggleUpvote(doubt.id)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  upvotedDoubts.has(doubt.id) 
                    ? 'text-blue-600 bg-blue-100' 
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={upvotedDoubts.has(doubt.id) ? 'Remove upvote' : 'Upvote'}
              >
                <FaThumbsUp />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black text-white">
      {/* Header Section */}
      <div className="sticky top-0 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Room: {roomId}
              </h1>
              <button
                onClick={handleCopyRoomId}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Copy Room ID"
              >
                <FaCopy />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {role !== 'participant' && (
                <>
                  <button
                    onClick={toggleQRCode}
                    className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {showQRCode ? 'Hide QR' : 'Show QR'}
                  </button>
                  <button
                    onClick={handleCloseRoom}
                    className="px-3 py-1.5 text-xs sm:text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Close Room
                  </button>
                </>
              )}
              {role !== 'host' && (
                <button
                  onClick={handleLeaveRoom}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Leave
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Section (for hosts) */}
      {role !== 'participant' && showQRCode && (
        <div className="bg-gray-800 bg-opacity-50 p-4 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <QRCode 
              value={`${FRONTEND_URL}/room/${roomId}`} 
              className="w-32 h-32 sm:w-40 sm:h-40"
            />
            <div className="text-center sm:text-left">
              <p className="text-sm sm:text-base text-gray-300">
                Share this QR code with participants
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Room ID: {roomId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Room Closure Message */}
      {roomClosureMessage && (
        <div className="bg-red-600 text-white p-4 text-center flex flex-col items-center gap-4">
          <p className="text-lg font-semibold">{roomClosureMessage}</p>
          {/* Download Doubts Button (visible to all users after room is closed) */}
          <button
            onClick={handleDownloadDoubts}
            className="mt-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Download All Doubts
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Doubt Input Section (for participants) */}
        {role === 'participant' && !isRoomClosed && (
          <div className="mb-8 bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FaQuestionCircle className="text-blue-400" />
                <h2 className="text-xl font-semibold">Ask Your Doubt</h2>
              </div>
              <textarea
                value={newDoubt}
                onChange={handleDoubtChange}
                placeholder="Type your doubt here..."
                className="w-full h-24 p-4 bg-white bg-opacity-95 text-gray-800 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none resize-none placeholder-gray-500"
                disabled={isRoomClosed}
              />
              {similarity > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-300">Similarity:</span>
                  <span className={`font-semibold ${similarity > 70 ? 'text-red-400' : similarity > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {similarity.toFixed(1)}%
                  </span>
                  {similarity > 70 && (
                    <span className="text-red-400 text-xs">(Consider checking existing doubts)</span>
                  )}
                </div>
              )}
              <button
                onClick={handleAddDoubt}
                disabled={isRoomClosed || newDoubt.trim() === ''}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
              >
                Submit Doubt
              </button>
            </div>
          </div>
        )}

        {/* Tabs for Active and Answered Doubts */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 bg-opacity-50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'active'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Active Doubts ({sortedActiveDoubts.length})
            </button>
            <button
              onClick={() => setActiveTab('answered')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'answered'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Answered ({sortedAnsweredDoubts.length})
            </button>
          </div>
        </div>

        {/* Doubts Container */}
        <div className="space-y-6">
          {activeTab === 'active' ? (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaQuestionCircle className="mr-2 text-blue-400" />
                Active Doubts
              </h3>
              {sortedActiveDoubts.length === 0 ? (
                <div className="text-center py-12 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
                  <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-300 mb-2">No active doubts</p>
                  {role === 'participant' && (
                    <p className="text-gray-400">Be the first to ask a question!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedActiveDoubts.map((doubt) => (
                    <DoubtCard key={doubt.id} doubt={doubt} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-green-400" />
                Answered Doubts
              </h3>
              {sortedAnsweredDoubts.length === 0 ? (
                <div className="text-center py-12 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
                  <FaCheckCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-300">No answered doubts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAnsweredDoubts.map((doubt) => (
                    <DoubtCard key={doubt.id} doubt={doubt} isAnswered={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default RoomPage;