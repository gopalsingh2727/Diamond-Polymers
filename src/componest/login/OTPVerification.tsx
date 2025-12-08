import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InfinitySpinner } from '../../components/InfinitySpinner';

interface OTPVerificationProps {
  email: string;
  userType: 'admin' | 'manager' | 'master-admin';
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  userType,
  onVerificationSuccess,
  onBack,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
  const apiKey = import.meta.env.VITE_API_KEY;

  // Auto-send OTP when component mounts
  useEffect(() => {
    sendOTP();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Send OTP function (uses new signup endpoints)
  const sendOTP = async () => {
    setResending(true);
    setError('');

    try {
      // Use new signup OTP endpoint (doesn't require user to exist)
      await axios.post(
        `${baseUrl}/signup/send-email-otp`,
        { email, userType },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email OTP sent to:', email);
      setSuccess('OTP sent! Please check your email.');
    } catch (err: any) {
      console.error('❌ Failed to send OTP:', err);
      setError(
        err.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    document.getElementById(`otp-${lastFilledIndex}`)?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use new signup OTP verification endpoint
      const response = await axios.post(
        `${baseUrl}/signup/verify-email-otp`,
        { email, otp: otpCode, userType },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess(response.data.message || 'Email verified successfully!');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        onVerificationSuccess();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp(['', '', '', '', '', '']); // Clear OTP inputs
    setTimeLeft(600); // Reset timer
    sendOTP();
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit code to
          </p>
          <p className="text-[#FF6B35] font-medium text-sm mt-1">{email}</p>
        </div>

        {/* OTP Input */}
        <form onSubmit={handleVerifyOTP}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-30 transition"
                disabled={loading || resending}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            {timeLeft > 0 ? (
              <p className="text-gray-600 text-sm">
                Code expires in{' '}
                <span className="font-bold text-[#FF6B35]">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <p className="text-red-600 text-sm font-medium">
                Code expired. Please request a new one.
              </p>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm text-center flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {success}
              </p>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg mb-4"
            disabled={loading || resending || timeLeft <= 0}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <InfinitySpinner size="sm" />
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-[#FF6B35] hover:text-[#FFA500] text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resending || timeLeft > 540} // Disable for first 1 minute
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <InfinitySpinner size="sm" />
                  Sending...
                </span>
              ) : (
                'Resend Code'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition"
            disabled={loading || resending}
          >
            ← Back to Login
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-xs text-center">
            🔒 For security, never share this code with anyone.
            <br />
            27 Manufacturing will never ask for your code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
