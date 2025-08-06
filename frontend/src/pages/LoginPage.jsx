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
    </div>
  );
};

export default LoginPage;