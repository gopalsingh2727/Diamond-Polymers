import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOGIN_REQUIRES_VERIFICATION,
  CLEAR_VERIFICATION_STATE,
} from "./authConstants";
import {
  SET_SELECTED_BRANCH_IN_AUTH,
  TOKEN_REFRESH_SUCCESS,
  TOKEN_REFRESH_FAIL,
  ADD_BRANCH_TO_AUTH,
  SESSION_EXPIRED,
  CLEAR_SESSION_EXPIRED,
  PHONE_OTP_REQUEST,
  PHONE_OTP_SENT,
  PHONE_OTP_FAIL,
  PHONE_OTP_VERIFY_REQUEST,
  PHONE_OTP_VERIFY_FAIL,
  CLEAR_PHONE_OTP_STATE,
} from "./authActions";

interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  userData: any | null;
  requiresVerification?: boolean;
  verificationEmail?: string;
  verificationUserType?: 'admin' | 'manager' | 'master_admin';
  tokenRefreshing?: boolean;
  sessionExpired?: boolean;
  // Phone OTP login states
  phoneOtpSending?: boolean;
  phoneOtpSent?: boolean;
  phoneOtpPhone?: string;
  phoneOtpUserType?: string;
  phoneOtpVerifying?: boolean;
  phoneOtpError?: string | null;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("authToken"),
  token: localStorage.getItem("authToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  userData: localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData")!)
    : null,
  requiresVerification: false,
  verificationEmail: undefined,
  verificationUserType: undefined,
  tokenRefreshing: false,
  sessionExpired: false,
  // Phone OTP initial states
  phoneOtpSending: false,
  phoneOtpSent: false,
  phoneOtpPhone: undefined,
  phoneOtpUserType: undefined,
  phoneOtpVerifying: false,
  phoneOtpError: null,
};

const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        requiresVerification: false,
        verificationEmail: undefined,
        verificationUserType: undefined,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        userData: action.payload.userData,
        error: null,
        requiresVerification: false,
        verificationEmail: undefined,
        verificationUserType: undefined,
        tokenRefreshing: false,
      };

    case TOKEN_REFRESH_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenRefreshing: false,
      };

    case TOKEN_REFRESH_FAIL:
      return {
        ...state,
        tokenRefreshing: false,
        error: action.payload,
      };

    case LOGIN_FAIL:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        token: null,
        userData: null,
        error: action.payload,
      };

    case LOGIN_REQUIRES_VERIFICATION:
      return {
        ...state,
        loading: false,
        requiresVerification: true,
        verificationEmail: action.payload.email,
        verificationUserType: action.payload.userType,
        error: action.payload.message,
      };

    case CLEAR_VERIFICATION_STATE:
      return {
        ...state,
        requiresVerification: false,
        verificationEmail: undefined,
        verificationUserType: undefined,
        error: null,
      };

    case LOGOUT:
      return {
        loading: false,
        error: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        userData: null,
        requiresVerification: false,
        verificationEmail: undefined,
        verificationUserType: undefined,
        tokenRefreshing: false,
      };

    case SET_SELECTED_BRANCH_IN_AUTH:
      return {
        ...state,
        userData: {
          ...state.userData,
          selectedBranch: action.payload,
        },
      };

    case ADD_BRANCH_TO_AUTH:
      const currentBranches = state.userData?.branches || [];
      const newBranches = [...currentBranches, action.payload];
      return {
        ...state,
        userData: {
          ...state.userData,
          branches: newBranches,
          // Auto-select the new branch if none is selected
          selectedBranch: state.userData?.selectedBranch || action.payload._id,
        },
      };

    case SESSION_EXPIRED:
      // ✅ Show session expired modal instead of logging out immediately
      return {
        ...state,
        sessionExpired: true,
        error: action.payload || 'Your session has expired. Please log in again.',
      };

    case CLEAR_SESSION_EXPIRED:
      return {
        ...state,
        sessionExpired: false,
        error: null,
      };

    // Phone OTP Login Cases
    case PHONE_OTP_REQUEST:
      return {
        ...state,
        phoneOtpSending: true,
        phoneOtpSent: false,
        phoneOtpError: null,
      };

    case PHONE_OTP_SENT:
      return {
        ...state,
        phoneOtpSending: false,
        phoneOtpSent: true,
        phoneOtpPhone: action.payload.phone,
        phoneOtpUserType: action.payload.userType,
        phoneOtpError: null,
      };

    case PHONE_OTP_FAIL:
      return {
        ...state,
        phoneOtpSending: false,
        phoneOtpSent: false,
        phoneOtpError: action.payload,
      };

    case PHONE_OTP_VERIFY_REQUEST:
      return {
        ...state,
        phoneOtpVerifying: true,
        phoneOtpError: null,
      };

    case PHONE_OTP_VERIFY_FAIL:
      return {
        ...state,
        phoneOtpVerifying: false,
        phoneOtpError: action.payload,
      };

    case CLEAR_PHONE_OTP_STATE:
      return {
        ...state,
        phoneOtpSending: false,
        phoneOtpSent: false,
        phoneOtpPhone: undefined,
        phoneOtpUserType: undefined,
        phoneOtpVerifying: false,
        phoneOtpError: null,
      };

    default:
      return state;
  }
};

export default authReducer;