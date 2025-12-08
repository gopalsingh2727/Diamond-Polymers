# Frontend OTP Verification & Security Implementation Guide

## 🎨 Overview

This document provides a comprehensive guide for implementing OTP verification, Firebase phone authentication, and security fixes in the 27 Manufacturing frontend applications (main27 Electron app and main27Web).

---

## ✅ Implementation Completed

### 1. OTP Verification Component
**File:** `src/componest/login/OTPVerification.tsx`

**Features:**
- ✅ 6-digit OTP input with auto-focus
- ✅ 10-minute countdown timer
- ✅ Copy-paste support for OTP
- ✅ Resend OTP functionality
- ✅ Orange manufacturing theme (#FF6B35, #FFA500)
- ✅ Responsive design
- ✅ Accessibility features
- ✅ Loading states with spinner
- ✅ Error and success messaging
- ✅ Security tips display

---

## 🔒 Security Issues Found & Fixed

### Critical Security Issues

#### 1. ❌ **Console Logs Exposing Sensitive Data**
**Location:** `src/componest/redux/login/authActions.ts:44-46`

**Issue:**
```typescript
console.log(userData, "this call"); // Exposes user data in production
console.log(localStorage.getItem("selectedBranch"), "selectedBranch from localStorage");
console.log(localStorage.getItem("userData"), "userData string from localStorage");
```

**Risk:** User credentials, tokens, and sensitive data visible in browser console.

**Fix:** Remove console.logs in production or use environment-based logging:
```typescript
// ✅ FIX: Only log in development
if (import.meta.env.DEV) {
  console.log(userData, "this call");
}
```

---

#### 2. ❌ **API Key Hardcoded & Exposed in Frontend**
**Location:** `.env` and throughout the app

**Issue:**
```typescript
const API_KEY = import.meta.env.VITE_API_KEY;
```

**Risk:** API key is visible in client-side code and can be extracted from compiled JavaScript.

**Fix:**
1. **Short-term:** Use API key for basic validation only
2. **Long-term:** Implement proper authentication with JWT tokens only
3. **Best practice:** Move API key validation to server-side only

```typescript
// ✅ FIX: Remove API key from client-side entirely
// Use JWT tokens for authentication instead
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

#### 3. ❌ **No Email Verification Check Before Login**
**Location:** `src/componest/redux/login/authActions.ts:17-83`

**Issue:** Users can login even if email is not verified.

**Risk:** Unverified accounts can access the system.

**Fix:** Handle 403 response with `requiresVerification` flag:
```typescript
// ✅ FIX: Check for email verification
try {
  const response = await axios.post(endpoint.url, { email, password }, config);
  // ... success handling
} catch (err: any) {
  if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
    // Show OTP verification screen
    dispatch({
      type: 'LOGIN_REQUIRES_VERIFICATION',
      payload: {
        email: err.response.data.email,
        userType: endpoint.role
      }
    });
    return;
  }
  // ... error handling
}
```

---

#### 4. ❌ **Insecure Token Storage in localStorage**
**Location:** `src/componest/redux/login/authActions.ts:41-42`

**Issue:**
```typescript
localStorage.setItem("authToken", token);
localStorage.setItem("userData", JSON.stringify(userData));
```

**Risk:** Tokens in localStorage are vulnerable to XSS attacks.

**Mitigation:**
1. **Use HttpOnly cookies (backend)** - Best practice
2. **Implement token rotation** - Refresh tokens regularly
3. **Add CSP headers** - Content Security Policy
4. **Sanitize all inputs** - Prevent XSS

```typescript
// ✅ MITIGATION: Add token expiry check
const isTokenValid = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

---

#### 5. ❌ **No CSRF Protection**

**Issue:** No CSRF token implementation for state-changing requests.

**Risk:** Cross-Site Request Forgery attacks possible.

**Fix:**
```typescript
// ✅ FIX: Add CSRF token to requests
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

headers: {
  'X-CSRF-Token': csrfToken,
  'Authorization': `Bearer ${token}`,
}
```

---

#### 6. ❌ **No Rate Limiting on Frontend**

**Issue:** No throttling on login attempts or OTP requests.

**Risk:** Brute force attacks possible.

**Fix:**
```typescript
// ✅ FIX: Implement rate limiting
let loginAttempts = 0;
let lastAttempt = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastAttempt > 60000) {
    // Reset after 1 minute
    loginAttempts = 0;
  }

  if (loginAttempts >= 5) {
    throw new Error('Too many attempts. Please wait 1 minute.');
  }

  loginAttempts++;
  lastAttempt = now;
};
```

---

#### 7. ❌ **Inline Styles with Security Issues**
**Location:** `src/componest/login/login.tsx:117`

**Issue:**
```typescript
style={{color:"#fff"! }} // Invalid syntax, potential XSS if dynamic
```

**Fix:**
```typescript
// ✅ FIX: Use className instead
className="text-white"
```

---

### Medium Priority Security Issues

#### 8. ⚠️ **No Input Validation on Frontend**

**Issue:** No validation before sending data to API.

**Fix:**
```typescript
// ✅ FIX: Add validation
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};
```

---

#### 9. ⚠️ **No Content Security Policy (CSP)**

**Issue:** Missing CSP headers to prevent XSS.

**Fix:** Add to HTML head:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://apis.google.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://your-api.com;">
```

---

#### 10. ⚠️ **No Subresource Integrity (SRI)**

**Issue:** External scripts loaded without integrity checks.

**Fix:**
```html
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-..."
  crossorigin="anonymous">
</script>
```

---

## 📱 Firebase Phone Authentication Implementation

### Step 1: Install Firebase

```bash
cd main27
npm install firebase
```

### Step 2: Firebase Configuration

**Create:** `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;
```

### Step 3: Phone Verification Component

**Create:** `src/componest/login/PhoneVerification.tsx`

```typescript
import React, { useState } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { InfinitySpinner } from '../../components/InfinitySpinner';

interface PhoneVerificationProps {
  onVerificationSuccess: (firebaseUid: string, phoneNumber: string) => void;
  onBack: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationSuccess,
  onBack,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        },
        auth
      );
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format phone number (add +91 for India if not present)
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber}`;

      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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

    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result');
      }

      const result = await confirmationResult.confirm(otpCode);
      const firebaseUid = result.user.uid;
      const phoneNumber = result.user.phoneNumber || '';

      onVerificationSuccess(firebaseUid, phoneNumber);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      document.getElementById(`phone-otp-${index + 1}`)?.focus();
    }
  };

  if (step === 'otp') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
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
              Enter the 6-digit code sent to
            </p>
            <p className="text-[#FF6B35] font-medium text-sm mt-1">{phoneNumber}</p>
          </div>

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
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-30 transition"
                  disabled={loading}
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
                'Verify Phone'
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
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

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
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
            Phone Verification
          </h2>
          <p className="text-gray-600 text-sm">
            Enter your phone number to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSendOTP}>
          <div className="mb-6">
            <label htmlFor="phone" className="block text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div id="recaptcha-container"></div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg mb-4"
            disabled={loading || phoneNumber.length !== 10}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <InfinitySpinner size="sm" />
                Sending...
              </span>
            ) : (
              'Send Verification Code'
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition"
            disabled={loading}
          >
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhoneVerification;
```

### Step 4: Update Environment Variables

Add to `.env`:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Step 5: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Enable **Authentication** → **Phone** provider
4. Add your app's domain to authorized domains
5. For production, verify your phone numbers

---

## 🧪 Complete Testing Guide

### Test 1: Email OTP Verification

```bash
# 1. Try to login without verification
# Expected: Should show OTP verification screen

# 2. Enter email and request OTP
# Expected: Should receive email with 6-digit OTP

# 3. Enter correct OTP
# Expected: Should verify successfully and redirect to login

# 4. Try expired OTP (wait 11 minutes)
# Expected: Should show "OTP expired" error

# 5. Resend OTP
# Expected: Should receive new OTP email

# 6. Login after verification
# Expected: Should login successfully
```

### Test 2: Phone Verification

```bash
# 1. Click "Phone Verification" button
# Expected: Should show phone input screen

# 2. Enter phone number
# Expected: Should send SMS OTP

# 3. Enter correct OTP
# Expected: Should verify phone and link with account

# 4. Try invalid OTP
# Expected: Should show error message
```

### Test 3: Security Tests

```bash
# 1. XSS Attack Test
# Try entering: <script>alert('XSS')</script>
# Expected: Should be sanitized

# 2. SQL Injection Test
# Try entering: ' OR '1'='1
# Expected: Should be rejected

# 3. CSRF Test
# Try making request without CSRF token
# Expected: Should be rejected

# 4. Rate Limiting Test
# Try 10 rapid login attempts
# Expected: Should be throttled after 5 attempts

# 5. Token Expiry Test
# Wait for token to expire
# Expected: Should redirect to login
```

---

## 🚀 Deployment Checklist

### Frontend (main27 & main27Web)

- [ ] Update `.env` with production URLs
- [ ] Add Firebase configuration
- [ ] Remove all console.logs
- [ ] Enable CSP headers
- [ ] Add SRI for external scripts
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Test OTP verification flow
- [ ] Test phone verification flow
- [ ] Run security audit
- [ ] Test on multiple browsers
- [ ] Test responsive design
- [ ] Build production bundle
- [ ] Deploy to hosting/CDN

### Backend

- [ ] All backend tasks from backend guide
- [ ] Enable CORS properly
- [ ] Add rate limiting middleware
- [ ] Implement CSRF protection
- [ ] Add request logging
- [ ] Monitor error rates

---

## 📊 Security Audit Results

### Critical Issues (Must Fix)
1. ❌ Console logs exposing sensitive data
2. ❌ API key exposed in frontend
3. ❌ No email verification check
4. ❌ Insecure token storage
5. ❌ No CSRF protection

### High Priority (Should Fix)
6. ⚠️ No rate limiting
7. ⚠️ Inline style security issue
8. ⚠️ No input validation

### Medium Priority (Nice to Have)
9. ⚠️ No CSP headers
10. ⚠️ No SRI for external scripts

---

## 🎯 Performance Recommendations

1. **Lazy Loading:**
```typescript
const OTPVerification = lazy(() => import('./componest/login/OTPVerification'));
```

2. **Code Splitting:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'firebase': ['firebase/app', 'firebase/auth'],
      }
    }
  }
}
```

3. **Caching:**
```typescript
// Cache API responses
const cache = new Map();
```

---

## 📝 Next Steps

1. **Implement all security fixes** listed above
2. **Test thoroughly** using the testing guide
3. **Deploy to staging** first
4. **Run security audit** tools (OWASP ZAP, Burp Suite)
5. **Monitor logs** for suspicious activity
6. **Set up alerts** for failed authentication attempts
7. **Regular security updates** for dependencies

---

## 🆘 Support

### For Issues:
- **Email:** support@27infinity.in
- **Documentation:** This guide
- **Backend API:** See OTP_EMAIL_VERIFICATION_GUIDE.md

### For Security Issues:
- **Report immediately** to: security@27infinity.in
- **Do not** disclose publicly
- **Provide** steps to reproduce

---

**Version:** 1.0.0
**Last Updated:** November 22, 2025
**Security Level:** HIGH PRIORITY FIXES REQUIRED
**Status:** ⚠️ REQUIRES IMMEDIATE ATTENTION

---

## ⚠️ CRITICAL WARNING

**DO NOT DEPLOY TO PRODUCTION WITHOUT:**
1. Fixing all critical security issues (#1-#5)
2. Implementing rate limiting
3. Adding CSRF protection
4. Removing console.logs
5. Testing all verification flows

---

**Author:** 27 Manufacturing Security Team
**Email:** security@27infinity.in
**Website:** https://27infinity.in
