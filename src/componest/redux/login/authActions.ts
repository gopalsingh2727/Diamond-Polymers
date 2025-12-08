import axios from "axios";
import {
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from "./authConstants";
import { getOrderFormDataIfNeeded, clearOrderFormData } from "../oders/orderFormDataActions";

export const SET_SELECTED_BRANCH_IN_AUTH = "SET_SELECTED_BRANCH_IN_AUTH";
export const LOGIN_REQUIRES_VERIFICATION = "LOGIN_REQUIRES_VERIFICATION";
export const TOKEN_REFRESH_SUCCESS = "TOKEN_REFRESH_SUCCESS";
export const TOKEN_REFRESH_FAIL = "TOKEN_REFRESH_FAIL";
export const SESSION_EXPIRED = "SESSION_EXPIRED"; // ✅ Show modal instead of auto-logout
export const CLEAR_SESSION_EXPIRED = "CLEAR_SESSION_EXPIRED";

// Phone OTP Login
export const PHONE_OTP_REQUEST = "PHONE_OTP_REQUEST";
export const PHONE_OTP_SENT = "PHONE_OTP_SENT";
export const PHONE_OTP_FAIL = "PHONE_OTP_FAIL";
export const PHONE_OTP_VERIFY_REQUEST = "PHONE_OTP_VERIFY_REQUEST";
export const PHONE_OTP_VERIFY_SUCCESS = "PHONE_OTP_VERIFY_SUCCESS";
export const PHONE_OTP_VERIFY_FAIL = "PHONE_OTP_VERIFY_FAIL";
export const CLEAR_PHONE_OTP_STATE = "CLEAR_PHONE_OTP_STATE";

// ✅ Base URL and API Key from env
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ SECURITY: Token refresh interval (refresh 1 minute before expiry)
const TOKEN_REFRESH_BUFFER = 60 * 1000; // 1 minute in milliseconds
let refreshTokenTimer: NodeJS.Timeout | null = null;

// ✅ SECURITY: Rate limiting for login attempts
let loginAttempts = 0;
let lastAttemptTime = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  const timeSinceLastAttempt = now - lastAttemptTime;

  // Reset counter after 1 minute
  if (timeSinceLastAttempt > 60000) {
    loginAttempts = 0;
  }

  if (loginAttempts >= 5) {
    throw new Error('Too many login attempts. Please wait 1 minute and try again.');
  }

  loginAttempts++;
  lastAttemptTime = now;
};

// ✅ SECURITY: Validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Password validation removed - accept any password

// ✅ Login - Uses unified API that auto-detects user type
export const login = (email: string, password: string) => {
  return async (dispatch: any) => {
    try {
      // ✅ SECURITY: Rate limiting check
      checkRateLimit();

      // ✅ SECURITY: Input validation
      if (!validateEmail(email)) {
        dispatch({
          type: LOGIN_FAIL,
          payload: "Invalid email format",
        });
        return;
      }

      dispatch({ type: LOGIN_REQUEST });

      // ✅ Try unified login endpoint first (auto-detects user type)
      try {
        const response = await axios.post(
          `${baseUrl}/auth/login`,
          { email, password },
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const { token, refreshToken, expiresIn, userType, user, branches } = response.data;
        const userData = { ...user, role: userType, branches };

        // ✅ Set default selected branch if branches available
        if (branches && branches.length > 0 && !userData.selectedBranch) {
          userData.selectedBranch = branches[0]._id;
        }

        // ✅ SECURITY FIX: Store tokens securely
        localStorage.setItem("authToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("tokenExpiresAt", String(Date.now() + (expiresIn || 900) * 1000));
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("userRole", userType);

        if (import.meta.env.DEV) {
          console.log('✅ Unified login successful for role:', userType, 'branches:', branches?.length || 0);
        }

        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            refreshToken,
            userData,
          },
        });

        // ✅ SECURITY: Set up automatic token refresh
        setupTokenRefresh(dispatch, userType, expiresIn || 900);

        // ✅ Reset rate limit counter on successful login
        loginAttempts = 0;

        // ✅ Fetch form data if user has selected a branch
        const selectedBranch = userData.selectedBranch;
        if (selectedBranch) {
          try {
            await dispatch(getOrderFormDataIfNeeded() as any);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error("Failed to fetch order form data on login:", error);
            }
          }
        }

        return;
      } catch (unifiedErr: any) {
        // ✅ Handle email verification requirement
        if (unifiedErr.response?.status === 403 && unifiedErr.response?.data?.requiresVerification) {
          dispatch({
            type: LOGIN_REQUIRES_VERIFICATION,
            payload: {
              email: unifiedErr.response.data.email,
              userType: unifiedErr.response.data.userType,
              message: unifiedErr.response.data.message
            }
          });
          return;
        }

        // ✅ Handle account lockout
        if (unifiedErr.response?.status === 423) {
          dispatch({
            type: LOGIN_FAIL,
            payload: unifiedErr.response.data.message || 'Account is locked. Please try again later.'
          });
          return;
        }

        // ✅ Handle invalid credentials from unified endpoint
        if (unifiedErr.response?.status === 401) {
          dispatch({
            type: LOGIN_FAIL,
            payload: unifiedErr.response.data.message || "Invalid email or password",
          });
          return;
        }

        if (import.meta.env.DEV) {
          console.log('Unified login failed, trying individual endpoints...');
        }
      }

      // ✅ Fallback: Try individual login endpoints
      const loginEndpoints = [
        { url: `${baseUrl}/master-admin/login`, role: "master_admin" },
        { url: `${baseUrl}/admin/login`, role: "admin" },
        { url: `${baseUrl}/manager/login`, role: "manager" },
      ];

      for (const endpoint of loginEndpoints) {
        try {
          const response = await axios.post(
            endpoint.url,
            { email, password },
            {
              headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          const { token, refreshToken, expiresIn, user, admin, manager, branches } = response.data;
          const userObj = user || admin || manager;
          const userData = { ...userObj, role: endpoint.role, branches };

          // ✅ Set default selected branch if branches available
          if (branches && branches.length > 0 && !userData.selectedBranch) {
            userData.selectedBranch = branches[0]._id;
          }

          localStorage.setItem("authToken", token);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("tokenExpiresAt", String(Date.now() + (expiresIn || 900) * 1000));
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("userRole", endpoint.role);

          if (import.meta.env.DEV) {
            console.log('✅ Login successful for role:', endpoint.role);
          }

          dispatch({
            type: LOGIN_SUCCESS,
            payload: {
              token,
              refreshToken,
              userData,
            },
          });

          setupTokenRefresh(dispatch, endpoint.role, expiresIn || 900);
          loginAttempts = 0;

          const selectedBranch = userData.selectedBranch;
          if (selectedBranch) {
            try {
              await dispatch(getOrderFormDataIfNeeded() as any);
            } catch (error) {
              if (import.meta.env.DEV) {
                console.error("Failed to fetch order form data on login:", error);
              }
            }
          }

          return;
        } catch (err: any) {
          if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
            dispatch({
              type: LOGIN_REQUIRES_VERIFICATION,
              payload: {
                email: err.response.data.email,
                userType: endpoint.role,
                message: err.response.data.message
              }
            });
            return;
          }

          if (err.response?.status === 423) {
            dispatch({
              type: LOGIN_FAIL,
              payload: err.response.data.message || 'Account is locked. Please try again later.'
            });
            return;
          }

          if (import.meta.env.DEV) {
            console.error(`Login failed for ${endpoint.role}`, err?.response?.status);
          }
        }
      }

      // If all failed
      dispatch({
        type: LOGIN_FAIL,
        payload: "Invalid email or password",
      });
    } catch (err: any) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.message || "Login failed. Please try again.",
      });
    }
  };
};

// ✅ SECURITY: Setup automatic token refresh
const setupTokenRefresh = (dispatch: any, role: string, expiresIn: number) => {
  // Clear any existing timer
  if (refreshTokenTimer) {
    clearTimeout(refreshTokenTimer);
  }

  // Calculate when to refresh (1 minute before expiry)
  const refreshTime = (expiresIn * 1000) - TOKEN_REFRESH_BUFFER;

  if (refreshTime > 0) {
    refreshTokenTimer = setTimeout(() => {
      dispatch(refreshAccessToken(role));
    }, refreshTime);
  }
};

// ✅ SECURITY: Refresh access token using refresh token
export const refreshAccessToken = (role?: string) => {
  return async (dispatch: any) => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const userRole = role || localStorage.getItem("userRole");

      if (!storedRefreshToken || !userRole) {
        dispatch(logout());
        return false;
      }

      const refreshEndpoint = userRole === 'master_admin'
        ? `${baseUrl}/master-admin/refresh-token`
        : userRole === 'admin'
        ? `${baseUrl}/admin/refresh-token`
        : `${baseUrl}/manager/refresh-token`;

      const response = await axios.post(
        refreshEndpoint,
        { refreshToken: storedRefreshToken },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const { token, refreshToken, expiresIn } = response.data;

      // Update stored tokens
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpiresAt", String(Date.now() + (expiresIn || 900) * 1000));

      dispatch({
        type: TOKEN_REFRESH_SUCCESS,
        payload: { token, refreshToken },
      });

      // Set up next refresh
      setupTokenRefresh(dispatch, userRole, expiresIn || 900);

      if (import.meta.env.DEV) {
        console.log('✅ Token refreshed successfully');
      }

      return true;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ Token refresh failed:', error?.response?.status);
      }

      dispatch({
        type: TOKEN_REFRESH_FAIL,
        payload: 'Session expired. Please log in again.',
      });

      // ✅ Show session expired modal instead of auto-logout
      dispatch({
        type: SESSION_EXPIRED,
        payload: 'Your session has expired. Please log in again to continue.',
      });
      return false;
    }
  };
};

// ✅ SECURITY: Check and refresh token if needed (handles laptop sleep/wake)
export const checkAndRefreshToken = () => {
  return async (dispatch: any) => {
    const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!tokenExpiresAt || !refreshToken) {
      return false;
    }

    const expiresAt = parseInt(tokenExpiresAt, 10);
    const now = Date.now();

    // ✅ FIX: If token is already expired OR expires in less than 2 minutes, refresh it
    // This handles the case when laptop wakes from sleep and token has expired
    if (now >= expiresAt || expiresAt - now < 2 * 60 * 1000) {
      if (import.meta.env.DEV) {
        const isExpired = now >= expiresAt;
        console.log(isExpired ? '⚠️ Token expired, refreshing...' : '⏰ Token expiring soon, refreshing...');
      }
      return await dispatch(refreshAccessToken());
    }

    // Token is still valid, set up refresh timer
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      const remainingTime = Math.floor((expiresAt - now) / 1000);
      setupTokenRefresh(dispatch, userRole, remainingTime);
    }

    return true;
  };
};

// ✅ Logout
export const logout = () => {
  return (dispatch: any) => {
    // ✅ SECURITY: Clear refresh timer
    if (refreshTokenTimer) {
      clearTimeout(refreshTokenTimer);
      refreshTokenTimer = null;
    }

    // ✅ SECURITY: Clear all sensitive data
    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresAt");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");

    // ✅ Clear order form data cache
    dispatch(clearOrderFormData());

    dispatch({ type: LOGOUT });

    if (import.meta.env.DEV) {
      console.log('✅ User logged out successfully');
    }
  };
};

// ✅ Set Selected Branch
export const setSelectedBranchInAuth = (branchId: string) => {
  return async (dispatch: any) => {
    // Get existing userData from localStorage
    const storedData = localStorage.getItem("userData");
    const userData = storedData ? JSON.parse(storedData) : {};

    // Update the userData object with the new branch
    const updatedUserData = {
      ...userData,
      selectedBranch: branchId,
    };

    // Save the updated userData back to localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    // Dispatch the action to update Redux store
    dispatch({
      type: SET_SELECTED_BRANCH_IN_AUTH,
      payload: branchId,
    });

    // ✅ Fetch form data for the newly selected branch (uses cache if available)
    try {
      await dispatch(getOrderFormDataIfNeeded() as any);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to fetch order form data for branch:", error);
      }
    }
  };
};

// ✅ SECURITY: Check if token is expired
export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("authToken");
  if (!token) return true;

  try {
    // Decode JWT token (simple decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expiryTime;
  } catch {
    return true;
  }
};

// ✅ SECURITY: Validate session
export const validateSession = () => {
  return (dispatch: any) => {
    if (isTokenExpired()) {
      dispatch(logout());
      return false;
    }
    return true;
  };
};

// ✅ Clear verification state
export const CLEAR_VERIFICATION_STATE = "CLEAR_VERIFICATION_STATE";
export const clearVerificationState = () => {
  return (dispatch: any) => {
    dispatch({ type: CLEAR_VERIFICATION_STATE });
  };
};

// ✅ Add branch to auth state (called when new branch is created)
export const ADD_BRANCH_TO_AUTH = "ADD_BRANCH_TO_AUTH";
export const addBranchToAuth = (branch: { _id: string; name: string; code?: string; location?: string; phone?: string; email?: string }) => {
  return (dispatch: any) => {
    // Update localStorage
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const userData = JSON.parse(storedData);
      userData.branches = [...(userData.branches || []), branch];
      // If no branch is selected, select this new one
      if (!userData.selectedBranch) {
        userData.selectedBranch = branch._id;
      }
      localStorage.setItem("userData", JSON.stringify(userData));
    }

    // Dispatch action to update Redux store
    dispatch({
      type: ADD_BRANCH_TO_AUTH,
      payload: branch,
    });
  };
};

// ✅ Clear session expired modal and logout
export const clearSessionExpiredAndLogout = () => {
  return (dispatch: any) => {
    dispatch({ type: CLEAR_SESSION_EXPIRED });
    dispatch(logout());
  };
};

// ============================================================================
// PHONE OTP LOGIN
// ============================================================================

// Validate phone number format
const validatePhone = (phone: string): boolean => {
  // Accept phone numbers with or without country code
  const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\d{10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// ✅ Request Phone OTP for login
export const requestPhoneOTP = (phone: string) => {
  return async (dispatch: any) => {
    try {
      // Input validation
      if (!phone) {
        dispatch({
          type: PHONE_OTP_FAIL,
          payload: "Phone number is required",
        });
        return;
      }

      if (!validatePhone(phone)) {
        dispatch({
          type: PHONE_OTP_FAIL,
          payload: "Invalid phone number format",
        });
        return;
      }

      dispatch({ type: PHONE_OTP_REQUEST });

      const response = await axios.post(
        `${baseUrl}/auth/request-phone-otp`,
        { phone },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      dispatch({
        type: PHONE_OTP_SENT,
        payload: {
          phone: response.data.phone,
          userType: response.data.userType,
          message: response.data.message,
        },
      });

      if (import.meta.env.DEV) {
        console.log('✅ Phone OTP sent to:', response.data.phone);
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please try again.";

      dispatch({
        type: PHONE_OTP_FAIL,
        payload: errorMessage,
      });

      return false;
    }
  };
};

// ✅ Verify Phone OTP and login
export const verifyPhoneOTP = (phone: string, otp: string) => {
  return async (dispatch: any) => {
    try {
      if (!phone || !otp) {
        dispatch({
          type: PHONE_OTP_VERIFY_FAIL,
          payload: "Phone number and OTP are required",
        });
        return false;
      }

      dispatch({ type: PHONE_OTP_VERIFY_REQUEST });

      const response = await axios.post(
        `${baseUrl}/auth/verify-phone-otp`,
        { phone, otp },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const { token, refreshToken, expiresIn, userType, user, branches } = response.data;
      const userData = { ...user, role: userType, branches };

      // Set default selected branch if branches available
      if (branches && branches.length > 0 && !userData.selectedBranch) {
        userData.selectedBranch = branches[0]._id;
      }

      // Store tokens securely
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpiresAt", String(Date.now() + (expiresIn || 900) * 1000));
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userRole", userType);

      if (import.meta.env.DEV) {
        console.log('✅ Phone OTP login successful for role:', userType, 'branches:', branches?.length || 0);
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token,
          refreshToken,
          userData,
        },
      });

      // Clear phone OTP state
      dispatch({ type: CLEAR_PHONE_OTP_STATE });

      // Set up automatic token refresh
      setupTokenRefresh(dispatch, userType, expiresIn || 900);

      // Reset rate limit counter on successful login
      loginAttempts = 0;

      // Fetch form data if user has selected a branch
      const selectedBranch = userData.selectedBranch;
      if (selectedBranch) {
        try {
          await dispatch(getOrderFormDataIfNeeded() as any);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to fetch order form data on login:", error);
          }
        }
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid OTP. Please try again.";
      const isExpired = err.response?.data?.expired;

      dispatch({
        type: PHONE_OTP_VERIFY_FAIL,
        payload: errorMessage,
        expired: isExpired,
      });

      return false;
    }
  };
};

// ✅ Clear phone OTP state
export const clearPhoneOTPState = () => {
  return (dispatch: any) => {
    dispatch({ type: CLEAR_PHONE_OTP_STATE });
  };
};
