<<<<<<< HEAD
import React from 'react';
import { account } from '../utils/appwrite';

const handleGoogleLogin = async () => {
  account.createOAuth2Session('google', window.location.origin, window.location.origin + '/').catch(console.error);
};

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-glow">
          Sign in to <span className="text-orange-500">Un</span>Doubt
        </h1>
        <p className="text-lg md:text-2xl mb-10">
          Please sign in with your Google account to continue.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="px-6 py-3 text-lg md:text-xl font-semibold bg-red-600 hover:bg-red-700 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center justify-center cursor-pointer"
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.23l6.9-6.9C36.68 2.36 30.7 0 24 0 14.82 0 6.73 5.08 2.69 12.44l8.06 6.26C12.6 13.13 17.88 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.75 28.7c-1.13-3.36-1.13-6.98 0-10.34l-8.06-6.26C.7 16.1 0 19.01 0 22c0 2.99.7 5.9 1.94 8.6l8.81-6.9z"/><path fill="#EA4335" d="M24 44c6.7 0 12.68-2.21 16.91-6.02l-7.19-5.6c-2.01 1.35-4.6 2.12-7.72 2.12-6.12 0-11.4-3.63-13.25-8.62l-8.81 6.9C6.73 42.92 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Sign in with Google
        </button>
      </div>
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, getGoogleRedirectResult, logOut } from '../config/firebase';
import { isEmailAllowed } from '../utils/emailValidation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGoogle } from 'react-icons/fa';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (result) {
          const userEmail = result.user.email;
          
          // Check if email is allowed
          if (!isEmailAllowed(userEmail)) {
            // Sign out the user immediately
            await logOut();
            toast.error('Access denied: This website is only for VNRVJIET students and faculty.');
            navigate('/access-denied');
            return;
          }
          
          toast.success('Successfully signed in with Google!');
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        toast.error('Failed to complete Google sign-in');
      }
    };

    checkRedirectResult();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const userEmail = result.user.email;
      
      // Check if email is allowed
      if (!isEmailAllowed(userEmail)) {
        // Sign out the user immediately
        await logOut();
        toast.error('Access denied: This website is only for VNRVJIET students and faculty.');
        navigate('/access-denied');
        return;
      }
      
      toast.success('Successfully signed in with Google!');
      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-black flex flex-col items-center justify-center text-white px-4">
      <div className="w-full max-w-sm sm:max-w-md p-4 sm:p-8 bg-gray-900 bg-opacity-50 rounded-lg shadow-2xl backdrop-blur-sm border border-gray-700">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-orange-500">Un</span>Doubt
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-4">
            Welcome to UnDoubt!
          </p>
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-2 sm:p-3 border border-blue-600">
            <p className="text-xs sm:text-sm text-blue-200">
              🎓 For VNRVJIET Students & Faculty Only
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Use your @vnrvjiet.in email address
            </p>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 mb-4 sm:mb-6 text-sm sm:text-lg font-semibold bg-white text-gray-900 hover:bg-gray-100 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <FaGoogle className="text-base sm:text-xl text-red-500" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Information */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-400 mb-2">
            Sign in with your VNRVJIET Google account
          </p>
          <p className="text-xs text-gray-500">
            Only @vnrvjiet.in email addresses are allowed
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
>>>>>>> saketh1607/main
    </div>
  );
};

<<<<<<< HEAD
export default LoginPage;
=======
export default LoginPage;
>>>>>>> saketh1607/main
