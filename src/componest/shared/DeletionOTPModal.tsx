import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

interface DeletionOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'branch' | 'admin' | 'manager' | 'employee';
  entityId: string;
  entityName: string;
  onSuccess: () => void;
}

const DeletionOTPModal: React.FC<DeletionOTPModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPassword('');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(600);
      setTimerActive(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setError('OTP has expired. Please request a new one.');
      setTimerActive(false);
    }
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getToken = () => localStorage.getItem('authToken');

  const handleRequestOTP = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${baseUrl}/deletion/request-otp`,
        {
          entityType,
          entityId,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            'x-api-key': API_KEY,
          },
        }
      );

      if (response.data.success) {
        setStep(2);
        setTimerActive(true);
        setTimeLeft(600);
        // Auto-focus first OTP input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${baseUrl}/deletion/request-otp`,
        {
          entityType,
          entityId,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            'x-api-key': API_KEY,
          },
        }
      );

      setTimeLeft(600);
      setTimerActive(true);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${baseUrl}/deletion/verify-and-delete`,
        {
          entityType,
          entityId,
          otp: otpCode,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            'x-api-key': API_KEY,
          },
        }
      );

      if (response.data.success) {
        setStep(3);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h2 className="text-xl font-bold">Critical Action</h2>
                <p className="text-sm opacity-90">Delete {entityType}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-red-700 rounded-full p-1 transition"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Entity Info */}
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
            <p className="text-sm font-semibold text-red-900 uppercase">{entityType}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{entityName}</p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-400 p-4 mb-6 rounded-lg">
            <p className="flex items-center gap-2 text-amber-900 font-semibold mb-2">
              <span>⚠️</span>
              <span>This action cannot be undone</span>
            </p>
            {entityType === 'branch' ? (
              <p className="flex items-center gap-2 text-amber-900 font-semibold">
                <span>🗑️</span>
                <span>All related data will be permanently deleted</span>
              </p>
            ) : (
              <p className="flex items-center gap-2 text-amber-900 font-semibold">
                <span>🗑️</span>
                <span>The {entityType} account will be permanently deleted</span>
              </p>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-bold text-sm`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-bold text-sm`}>
                2
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'} font-bold text-sm`}>
                3
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Password */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password to request OTP
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRequestOTP()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your master admin password"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                This password will be verified before sending the OTP to your email.
              </p>
              <button
                onClick={handleRequestOTP}
                disabled={loading || !password}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {loading ? 'Sending OTP...' : 'Request Deletion OTP'}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Enter the 6-digit code sent to your email
                </p>
                {timerActive && (
                  <p className="text-lg font-bold text-red-600">
                    ⏱️ {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded">
                <p className="text-sm text-blue-900">
                  💡 After entering the OTP, you will need to confirm your password again.
                </p>
              </div>

              <button
                onClick={handleVerifyAndDelete}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition mb-3"
              >
                {loading ? 'Verifying & Deleting...' : 'Confirm Deletion'}
              </button>

              <button
                onClick={handleResendOTP}
                disabled={loading || timerActive}
                className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                Resend OTP {timerActive && `(${formatTime(timeLeft)})`}
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Deleted Successfully</h3>
              <p className="text-gray-600">
                The {entityType} has been permanently deleted.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full text-gray-700 hover:text-gray-900 font-medium py-2 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletionOTPModal;
