import React, { useState } from 'react';
import axios from 'axios';
import { InfinitySpinner } from '../../components/InfinitySpinner';
import OTPVerification from './OTPVerification';
import PhoneVerification from './PhoneVerification';
import '../../styles/otp-verification.css';

interface SignupProps {
  userType: 'admin' | 'manager' | 'master-admin';
  onSignupSuccess: () => void;
  onBack: () => void;
  branchId?: string; // Required for manager and admin
}

type SignupStep = 'details' | 'email-verification' | 'phone-verification' | 'complete';

const Signup: React.FC<SignupProps> = ({
  userType,
  onSignupSuccess,
  onBack,
  branchId,
}) => {
  const [currentStep, setCurrentStep] = useState<SignupStep>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    fullName: '',
  });

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
  const apiKey = import.meta.env.VITE_API_KEY;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    // ✅ Password length validation removed - accept any password

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if ((userType === 'admin' || userType === 'manager') && !branchId) {
      setError('Branch ID is required');
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Send email OTP (DON'T save user yet)
      // User data will be saved ONLY after both verifications are complete
      await axios.post(
        `${baseUrl}/signup/send-email-otp`,
        {
          email: formData.email,
          phone: formData.phone,
          userType: userType,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email OTP sent, moving to verification...');

      // Step 2: Move to email verification (user NOT saved yet)
      setCurrentStep('email-verification');
    } catch (err: any) {
      console.error('❌ Failed to send OTP:', err);
      setError(
        err.response?.data?.message || 'Failed to send verification email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationSuccess = () => {
    console.log('✅ Email verified! Moving to phone verification...');
    setCurrentStep('phone-verification');
  };

  const handlePhoneVerificationSuccess = async () => {
    console.log('✅ Phone verified! Now creating user account...');
    setLoading(true);
    setError('');

    try {
      // Create user ONLY after both email and phone are verified
      await axios.post(
        `${baseUrl}/signup/complete`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          fullName: formData.fullName,
          userType: userType,
          ...(branchId && { branchId }),
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ User account created successfully!');
      setCurrentStep('complete');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        onSignupSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Failed to create account:', err);
      setError(
        err.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setCurrentStep('details');
  };

  // Step 1: Signup Form
  if (currentStep === 'details') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <form
          onSubmit={handleSignup}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-6">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Create {userType === 'master-admin' ? 'Master Admin' : userType === 'manager' ? 'Manager' : 'Admin'} Account
            </h2>
            <p className="text-gray-600 text-sm">
              Fill in your details to get started
            </p>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 text-sm mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm mb-2">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm mb-2">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm mb-2">
              Phone Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm mb-2">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg mb-4"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <InfinitySpinner size="sm" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition"
            disabled={loading}
          >
            ← Back to Login
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-xs text-center">
              📧 Email OTP + 📱 Phone SMS verification required
            </p>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Email OTP Verification
  if (currentStep === 'email-verification') {
    return (
      <OTPVerification
        email={formData.email}
        userType={userType}
        onVerificationSuccess={handleEmailVerificationSuccess}
        onBack={handleBackToDetails}
      />
    );
  }

  // Step 3: Phone OTP Verification
  if (currentStep === 'phone-verification') {
    return (
      <PhoneVerification
        phoneNumber={formData.phone}
        userEmail={formData.email}
        userType={userType}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        onBack={() => setCurrentStep('email-verification')}
      />
    );
  }

  // Step 4: Complete
  if (currentStep === 'complete') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-600"
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
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎉 Account Created Successfully!
          </h2>

          <p className="text-gray-600 mb-6">
            Your email and phone number have been verified.
            <br />
            Redirecting to login...
          </p>

          <div className="flex justify-center">
            <InfinitySpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Signup;
