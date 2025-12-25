import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearVerificationState } from "../redux/login/authActions";
import type { AppDispatch } from '../../store';
import { InfinitySpinner } from '../../components/InfinitySpinner';
import OTPVerification from './OTPVerification';
import '../../styles/otp-verification.css';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const auth = useSelector((state: any) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      </div>
    </div>
  );
};

export default LoginForm;
