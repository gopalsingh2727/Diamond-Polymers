import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { InfinitySpinner } from '../../components/InfinitySpinner';
import PhoneVerification from './PhoneVerification';
import { LOGIN_SUCCESS } from '../redux/login/authConstants';
import '../../styles/otp-verification.css';
import './Signup.css';

type SignupStep = 'details' | 'email-verification' | 'phone-verification' | 'complete';

const UnifiedAuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sign Up State
  const [signupStep, setSignupStep] = useState<SignupStep>('details');
  // Form step state (1-4)
  const [formStep, setFormStep] = useState(1);
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone1: '',
    phone2: '',
    whatsapp: '',
    telephone: '',
    address1: '',
    address2: '',
    state: '',
    pinCode: '',
    marketingWhatsApp: false,
    marketingSMS: false,
    marketingEmail: false,
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
  const apiKey = import.meta.env.VITE_API_KEY;

  // ============= SIGN UP FUNCTIONS =============

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignUpData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateSignUpForm = (): boolean => {
    if (!signUpData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!signUpData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!signUpData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (!signUpData.password) {
      setError('Password is required');
      return false;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!signUpData.phone1.trim()) {
      setError('Primary phone number is required');
      return false;
    }
    if (!signUpData.whatsapp.trim()) {
      setError('WhatsApp number is required for verification');
      return false;
    }
    if (!signUpData.address1.trim()) {
      setError('Address is required');
      return false;
    }
    if (!signUpData.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!signUpData.pinCode.trim()) {
      setError('Pin code is required');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUpForm()) {
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
          email: signUpData.email,
          phone: signUpData.whatsapp,
          userType: 'master-admin', // Create as master admin
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email OTP sent, moving to verification...');

      // Move to email verification (user NOT saved yet)
      setSignupStep('email-verification');
    } catch (err: any) {
      console.error('❌ Failed to send OTP:', err);
      setError(err.response?.data?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationSuccess = () => {
    console.log('✅ Email verified! Moving to phone verification...');
    setSignupStep('phone-verification');
  };

  const handlePhoneVerificationSuccess = async () => {
    console.log('✅ Phone verified! Now creating admin account...');
    setLoading(true);
    setError('');

    try {
      // Create admin ONLY after both email and phone are verified
      const response = await axios.post(
        `${baseUrl}/signup/complete`,
        {
          email: signUpData.email,
          password: signUpData.password,
          phone: signUpData.whatsapp,
          userType: 'master-admin', // Create as master admin
          username: signUpData.email.split('@')[0], // Use email prefix as username
          fullName: `${signUpData.firstName} ${signUpData.lastName}`.trim(),
          // User-specific fields
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
          companyName: signUpData.companyName,
          phone1: signUpData.phone1,
          phone2: signUpData.phone2,
          whatsapp: signUpData.whatsapp,
          telephone: signUpData.telephone,
          address1: signUpData.address1,
          address2: signUpData.address2,
          state: signUpData.state,
          pinCode: signUpData.pinCode,
          marketingWhatsApp: signUpData.marketingWhatsApp,
          marketingSMS: signUpData.marketingSMS,
          marketingEmail: signUpData.marketingEmail,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Master Admin account created successfully!');

      // Auto-login: Store token and user data
      const { token, refreshToken, user } = response.data;
      if (token && user) {
        const userData = {
          ...user,
          token,
          refreshToken,
        };

        // Store in localStorage (use 'authToken' to match reducer)
        localStorage.setItem('authToken', token);
        localStorage.setItem('token', token); // Keep for backward compatibility
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userRole', user.role);

        // Dispatch LOGIN_SUCCESS to Redux
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            refreshToken,
            userData,
          },
        });

        console.log('✅ Auto-login successful! Redirecting to create branch...');

        // Redirect to create branch page
        setSignupStep('complete');
        setTimeout(() => {
          navigate('/create-branch');
        }, 1500);
      } else {
        // Fallback to login page if no token
        setSignupStep('complete');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Failed to create account:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignUpForm = () => {
    setSignupStep('details');
  };

  // ============= RENDER SIGNUP STEPS =============

  // Email OTP Verification Step
  if (signupStep === 'email-verification') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 text-sm">We've sent a 6-digit code to</p>
            <p className="text-[#FF6B35] font-medium text-sm mt-1">{signUpData.email}</p>
          </div>

          {/* OTP Input */}
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');

            try {
              const otpInputs = document.querySelectorAll('.otp-digit') as NodeListOf<HTMLInputElement>;
              const otpCode = Array.from(otpInputs).map(input => input.value).join('');

              if (otpCode.length !== 6) {
                setError('Please enter all 6 digits');
                setLoading(false);
                return;
              }

              const response = await axios.post(
                `${baseUrl}/signup/verify-email-otp`,
                { email: signUpData.email, otp: otpCode, userType: 'master-admin' },
                { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
              );

              console.log('✅ Email verified:', response.data);
              handleEmailVerificationSuccess();
            } catch (err: any) {
              setError(err.response?.data?.message || 'Verification failed. Please try again.');
            } finally {
              setLoading(false);
            }
          }}>
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="otp-digit w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-30 transition"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value && i < 5) {
                      const next = target.nextElementSibling as HTMLInputElement;
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Backspace' && !target.value && i > 0) {
                      const prev = target.previousElementSibling as HTMLInputElement;
                      prev?.focus();
                    }
                  }}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg mb-4"
              disabled={loading}
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

            <button
              type="button"
              onClick={handleBackToSignUpForm}
              className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition"
              disabled={loading}
            >
              ← Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Phone OTP Verification Step (WhatsApp)
  if (signupStep === 'phone-verification') {
    return (
      <PhoneVerification
        phoneNumber={signUpData.whatsapp}
        userEmail={signUpData.email}
        userType="master-admin"
        onVerificationSuccess={handlePhoneVerificationSuccess}
        onBack={() => setSignupStep('email-verification')}
      />
    );
  }

  // Signup Complete Step
  if (signupStep === 'complete') {
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
            Account Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been verified.
            <br />
            Redirecting...
          </p>
          <div className="flex justify-center">
            <InfinitySpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  // ============= STEP VALIDATION =============

  const validateStep = (step: number): boolean => {
    setError('');
    switch (step) {
      case 1: // Personal Information
        if (!signUpData.firstName.trim()) {
          setError('First name is required');
          return false;
        }
        if (!signUpData.lastName.trim()) {
          setError('Last name is required');
          return false;
        }
        return true;
      case 2: // Address
        if (!signUpData.address1.trim()) {
          setError('Address is required');
          return false;
        }
        if (!signUpData.state.trim()) {
          setError('State is required');
          return false;
        }
        if (!signUpData.pinCode.trim()) {
          setError('Pin code is required');
          return false;
        }
        return true;
      case 3: // Contact Information
        if (!signUpData.email.trim()) {
          setError('Email is required');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signUpData.email)) {
          setError('Invalid email format');
          return false;
        }
        if (!signUpData.phone1.trim()) {
          setError('Primary phone number is required');
          return false;
        }
        if (!signUpData.whatsapp.trim()) {
          setError('WhatsApp number is required for verification');
          return false;
        }
        return true;
      case 4: // Security
        if (!signUpData.password) {
          setError('Password is required');
          return false;
        }
        if (signUpData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (signUpData.password !== signUpData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(formStep + 1);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setFormStep(formStep - 1);
  };

  // ============= MAIN SIGNUP PAGE =============

  return (
    <div className="Signup-container">
      <div className="Signup-card">
        {/* Close Button */}
        <button
          onClick={() => window.location.href = '#/login'}
          className="Signup-closeButton"
          title="Close"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo/Header */}
        <div className="Signup-header">
          <div className="Signup-logoWrapper">
            <img src="/eagle-icon.svg" alt="Logo" className="Signup-logo" />
          </div>
          <h1 className="Signup-title">27 Manufacturing</h1>
          <p className="Signup-subtitle">Create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="Signup-progress">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="Signup-progressStep">
              <div className={`Signup-progressNumber ${formStep === step ? 'active' : ''} ${formStep > step ? 'completed' : ''}`}>
                {formStep > step ? '✓' : step}
              </div>
              {index < 3 && (
                <div className={`Signup-progressLine ${formStep > step ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* SIGNUP FORM */}
        <form onSubmit={handleSignUp}>

          {/* Step 1: Personal Information */}
          {formStep === 1 && (
            <div className="Signup-section">
              <div className="Signup-sectionHeader">
                <span className="Signup-sectionNumber">1</span>
                <h3 className="Signup-sectionTitle">Personal Information</h3>
              </div>

              <div className="Signup-inputRow">
                <div className="Signup-inputGroup">
                  <label className="Signup-label">First Name *</label>
                  <input
                    name="firstName"
                    type="text"
                    className="Signup-input"
                    placeholder="First name"
                    value={signUpData.firstName}
                    onChange={handleSignUpChange}
                  />
                </div>
                <div className="Signup-inputGroup">
                  <label className="Signup-label">Last Name *</label>
                  <input
                    name="lastName"
                    type="text"
                    className="Signup-input"
                    placeholder="Last name"
                    value={signUpData.lastName}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>

              <div className="Signup-inputGroup">
                <label className="Signup-label">Company Name (Optional)</label>
                <input
                  name="companyName"
                  type="text"
                  className="Signup-input"
                  placeholder="Company name"
                  value={signUpData.companyName}
                  onChange={handleSignUpChange}
                />
              </div>

              {error && (
                <div className="Signup-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="Signup-buttonRow">
                <button type="button" className="Signup-buttonNext" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {formStep === 2 && (
            <div className="Signup-section">
              <div className="Signup-sectionHeader">
                <span className="Signup-sectionNumber">2</span>
                <h3 className="Signup-sectionTitle">Address</h3>
              </div>

              <div className="Signup-inputGroup">
                <label className="Signup-label">Address Line 1 *</label>
                <input
                  name="address1"
                  type="text"
                  className="Signup-input"
                  placeholder="Street address, building, etc."
                  value={signUpData.address1}
                  onChange={handleSignUpChange}
                />
              </div>

              <div className="Signup-inputGroup">
                <label className="Signup-label">Address Line 2</label>
                <input
                  name="address2"
                  type="text"
                  className="Signup-input"
                  placeholder="Apartment, suite, unit, etc."
                  value={signUpData.address2}
                  onChange={handleSignUpChange}
                />
              </div>

              <div className="Signup-inputRow">
                <div className="Signup-inputGroup">
                  <label className="Signup-label">State *</label>
                  <input
                    name="state"
                    type="text"
                    className="Signup-input"
                    placeholder="Maharashtra"
                    value={signUpData.state}
                    onChange={handleSignUpChange}
                  />
                </div>
                <div className="Signup-inputGroup">
                  <label className="Signup-label">Pin Code *</label>
                  <input
                    name="pinCode"
                    type="text"
                    className="Signup-input"
                    placeholder="400001"
                    value={signUpData.pinCode}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>

              {error && (
                <div className="Signup-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="Signup-buttonRow">
                <button type="button" className="Signup-buttonBack" onClick={handlePrevStep}>
                  Back
                </button>
                <button type="button" className="Signup-buttonNext" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {formStep === 3 && (
            <div className="Signup-section">
              <div className="Signup-sectionHeader">
                <span className="Signup-sectionNumber">3</span>
                <h3 className="Signup-sectionTitle">Contact Information</h3>
              </div>

              <div className="Signup-inputGroup">
                <label className="Signup-label">Email *</label>
                <input
                  name="email"
                  type="email"
                  className="Signup-input"
                  placeholder="your@email.com"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                />
              </div>

              <div className="Signup-inputRow">
                <div className="Signup-inputGroup">
                  <label className="Signup-label">Primary Phone *</label>
                  <input
                    name="phone1"
                    type="tel"
                    className="Signup-input"
                    placeholder="+91 9876543210"
                    value={signUpData.phone1}
                    onChange={handleSignUpChange}
                  />
                </div>
                <div className="Signup-inputGroup">
                  <label className="Signup-label">WhatsApp Number *</label>
                  <input
                    name="whatsapp"
                    type="tel"
                    className="Signup-input"
                    placeholder="+91 9876543210"
                    value={signUpData.whatsapp}
                    onChange={handleSignUpChange}
                  />
                  <p className="Signup-inputHint">We'll verify this number via OTP</p>
                </div>
              </div>

              {/* Marketing Permissions */}
              <div className="Signup-checkboxGroup">
                <p className="Signup-checkboxTitle">Marketing Permissions (Optional)</p>
                <label className="Signup-checkbox">
                  <input
                    type="checkbox"
                    name="marketingWhatsApp"
                    checked={signUpData.marketingWhatsApp}
                    onChange={handleSignUpChange}
                  />
                  <span>Send me marketing messages on WhatsApp</span>
                </label>
                <label className="Signup-checkbox">
                  <input
                    type="checkbox"
                    name="marketingSMS"
                    checked={signUpData.marketingSMS}
                    onChange={handleSignUpChange}
                  />
                  <span>Send me marketing SMS messages</span>
                </label>
                <label className="Signup-checkbox">
                  <input
                    type="checkbox"
                    name="marketingEmail"
                    checked={signUpData.marketingEmail}
                    onChange={handleSignUpChange}
                  />
                  <span>Send me marketing emails</span>
                </label>
              </div>

              {error && (
                <div className="Signup-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="Signup-buttonRow">
                <button type="button" className="Signup-buttonBack" onClick={handlePrevStep}>
                  Back
                </button>
                <button type="button" className="Signup-buttonNext" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Security */}
          {formStep === 4 && (
            <div className="Signup-section">
              <div className="Signup-sectionHeader">
                <span className="Signup-sectionNumber">4</span>
                <h3 className="Signup-sectionTitle">Security</h3>
              </div>

              <div className="Signup-inputRow">
                <div className="Signup-inputGroup">
                  <label className="Signup-label">Password *</label>
                  <input
                    name="password"
                    type="password"
                    className="Signup-input"
                    placeholder="Your password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                  />
                </div>
                <div className="Signup-inputGroup">
                  <label className="Signup-label">Confirm Password *</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="Signup-input"
                    placeholder="Confirm password"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>

              {error && (
                <div className="Signup-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="Signup-buttonRow">
                <button type="button" className="Signup-buttonBack" onClick={handlePrevStep}>
                  Back
                </button>
                <button
                  type="submit"
                  className="Signup-buttonSubmit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="Signup-loading">
                      <InfinitySpinner size="sm" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="Signup-info">
                <p>Email + Phone verification will be required</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;
