import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearVerificationState, requestPhoneOTP, verifyPhoneOTP, clearPhoneOTPState } from "../redux/login/authActions";
import type { AppDispatch } from '../../store';
import { InfinitySpinner } from '../../components/InfinitySpinner';
import OTPVerification from './OTPVerification';
import '../../styles/otp-verification.css';

type LoginMethod = 'email' | 'phone';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const auth = useSelector((state: any) => state.auth);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const handleRequestPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(requestPhoneOTP(phone));
  };

  const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(verifyPhoneOTP(phone, otp));
  };

  const handleBackFromPhoneOTP = () => {
    dispatch(clearPhoneOTPState());
    setOtp("");
  };

  const handleVerificationSuccess = () => {
    dispatch(clearVerificationState());
    setEmail("");
    setPassword("");
  };

  const handleBackToLogin = () => {
    dispatch(clearVerificationState());
  };

  const switchLoginMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    dispatch(clearPhoneOTPState());
    setOtp("");
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

        {/* Login Method Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => switchLoginMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginMethod === 'email'
                ? 'bg-white text-[#FF6B35] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => switchLoginMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginMethod === 'phone'
                ? 'bg-white text-[#FF6B35] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Email/Password Login */}
        {loginMethod === 'email' && (
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
        )}

        {/* Phone OTP Login */}
        {loginMethod === 'phone' && (
          <>
            {!auth.phoneOtpSent ? (
              <form onSubmit={handleRequestPhoneOTP}>
                <div className="mb-5">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 10-digit number (e.g., 9876543210)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                  disabled={auth.phoneOtpSending}
                >
                  {auth.phoneOtpSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <InfinitySpinner size="sm" />
                      Sending OTP...
                    </span>
                  ) : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOTP}>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    OTP sent to <strong>{auth.phoneOtpPhone}</strong>
                  </p>
                </div>

                <div className="mb-5">
                  <label htmlFor="otp" className="block text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition text-center text-xl tracking-widest"
                    type="text"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                  disabled={auth.phoneOtpVerifying || otp.length !== 6}
                >
                  {auth.phoneOtpVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <InfinitySpinner size="sm" />
                      Verifying...
                    </span>
                  ) : "Verify & Login"}
                </button>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleBackFromPhoneOTP}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(requestPhoneOTP(phone))}
                    disabled={auth.phoneOtpSending}
                    className="text-[#FF6B35] hover:text-[#FFA500] text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Error Messages */}
        <div className="mt-4 text-center">
          {(auth.error || auth.phoneOtpError) && (
            <p className="text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-100">
              {auth.error || auth.phoneOtpError}
            </p>
          )}
        </div>

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