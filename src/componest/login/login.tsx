import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearVerificationState } from "../redux/login/authActions";
import type { AppDispatch } from '../../store';
import { InfinitySpinner } from '../../components/InfinitySpinner';
import OTPVerification from './OTPVerification';
import QRCodeLogin from './QRCodeLogin';
import '../../styles/otp-verification.css';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const auth = useSelector((state: any) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<'email' | 'qr'>('email');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const handleVerificationSuccess = () => {
    dispatch(clearVerificationState());
    setEmail("");
    setPassword("");
  };

  const handleBackToLogin = () => {
    dispatch(clearVerificationState());
  };

  // Show OTP verification screen if email verification is required
  if (auth.requiresVerification && auth.verificationEmail && auth.verificationUserType) {
    return (
      <OTPVerification
        email={auth.verificationEmail}
        userType={auth.verificationUserType}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {loginMode === 'email' ? (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Welcome
            </h2>

            {/* Email/Password Login */}
            <form onSubmit={handleEmailLogin}>
              <div className="mb-5">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                disabled={auth.loading}
              >
                {auth.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <InfinitySpinner size="sm" />
                    Logging in...
                  </span>
                ) : "Login"}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[#fff] hover:text-[#FFA500] text-sm font-medium underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            {/* QR Login Toggle */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLoginMode('qr')}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Login with QR Code
              </button>
            </div>

            {/* Error Messages */}
            {auth.error && (
              <div className="mt-4 text-center">
                <p className="text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-100">
                  {auth.error}
                </p>
              </div>
            )}

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <a
                  href="#/signup"
                  className="text-[#FF6B35] hover:text-[#FFA500] font-medium underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </>
        ) : (
          <QRCodeLogin onBack={() => setLoginMode('email')} />
        )}
      </div>
    </div>
  );
};

export default LoginForm;
