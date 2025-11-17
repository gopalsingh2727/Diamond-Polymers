import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/login/authActions";
import type { AppDispatch } from '../../store';
import axios from 'axios';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  const auth = useSelector((state: any) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  dispatch(login(email, password));
};

const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setForgotPasswordLoading(true);
  setForgotPasswordMessage("");
  setForgotPasswordError("");

  try {
    const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000';
    const apiKey = import.meta.env.VITE_API_KEY;

    const response = await axios.post(
      `${baseUrl}/admin/request-password-reset`,
      { email: forgotEmail },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    setForgotPasswordMessage(response.data.message);
    setForgotEmail("");

    // Close modal after 3 seconds
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotPasswordMessage("");
    }, 3000);
  } catch (error: any) {
    setForgotPasswordError(
      error.response?.data?.message || 'Failed to send reset email. Please try again.'
    );
  } finally {
    setForgotPasswordLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <form 
        onSubmit={handleLogin} 
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Welcome
        </h2>
        
        <div className="mb-5">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
          disabled={auth.loading}
        >
          {auth.loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : "Login"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-4 text-center">
          {auth.error && (
            <p className="text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-100">
              {auth.error}
            </p>
          )}
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                  setForgotPasswordMessage("");
                  setForgotPasswordError("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleForgotPassword}>
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="mb-6">
                <label htmlFor="forgot-email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              {forgotPasswordMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {forgotPasswordMessage}
                </div>
              )}

              {forgotPasswordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {forgotPasswordError}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400"
              >
                {forgotPasswordLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;