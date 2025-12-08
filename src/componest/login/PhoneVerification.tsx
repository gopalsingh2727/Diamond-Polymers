import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InfinitySpinner } from '../../components/InfinitySpinner';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: (phoneVerified: boolean) => void;
  onBack: () => void;
  userEmail: string;
  userType?: 'admin' | 'manager' | 'master-admin' | 'user';
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onBack,
  userEmail,
  userType = 'master-admin',
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [otpSent, setOtpSent] = useState(false);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone.startsWith('+')) {
      return `+91${phone}`;
    }
    return phone;
  };

  const sendOTP = async () => {
    setSending(true);
    setError('');
    setSuccess('');

    try {
      // Send OTP via backend WhatsApp API
      await axios.post(
        `${baseUrl}/signup/send-phone-otp`,
        {
          email: userEmail,
          phone: phoneNumber,
          userType: userType,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      setOtpSent(true);
      setSuccess(`OTP sent to WhatsApp ${formatPhoneNumber(phoneNumber)}`);
      setTimeLeft(600); // Reset timer
      console.log('✅ Phone OTP sent via WhatsApp');
    } catch (err: any) {
      console.error('❌ Failed to send phone OTP:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
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
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`phone-otp-${index - 1}`);
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
    document.getElementById(`phone-otp-${lastFilledIndex}`)?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!otpSent) {
      setError('Please request OTP first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verify OTP via backend
      await axios.post(
        `${baseUrl}/signup/verify-phone-otp`,
        {
          email: userEmail,
          phone: phoneNumber,
          userType: userType,
          otp: otpCode,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Phone OTP verified');
      setSuccess('Phone number verified successfully!');

      // Call success callback after 1.5 seconds
      setTimeout(() => {
        onVerificationSuccess(true);
      }, 1500);
    } catch (err: any) {
      console.error('❌ Phone verification failed:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp(['', '', '', '', '', '']);
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verify Phone Number
          </h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit code to your WhatsApp
          </p>
          <p className="text-[#FF6B35] font-medium text-sm mt-1">
            {formatPhoneNumber(phoneNumber)}
          </p>
          <p className="text-green-600 text-xs mt-2 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            OTP sent via WhatsApp
          </p>
        </div>

        {/* OTP Input */}
        <form onSubmit={handleVerifyOTP}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`phone-otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-30 transition"
                disabled={loading || sending}
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
            disabled={loading || sending || timeLeft <= 0 || !otpSent}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <InfinitySpinner size="sm" />
                Verifying...
              </span>
            ) : (
              'Verify Phone'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-[#FF6B35] hover:text-[#FFA500] text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending || timeLeft > 540} // Disable for first 1 minute
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <InfinitySpinner size="sm" />
                  Sending...
                </span>
              ) : (
                'Resend Code'
              )}
            </button>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition"
            disabled={loading || sending}
          >
            ← Back
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

export default PhoneVerification;
