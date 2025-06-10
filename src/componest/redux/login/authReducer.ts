import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from "./authConstants";
import { SET_SELECTED_BRANCH_IN_AUTH } from "./authActions";

interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  userData: any | null;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("authToken"),
  token: localStorage.getItem("authToken"),
  userData: localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData")!)
    : null,
};

const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        userData: action.payload.userData,
        error: null,
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

    case LOGOUT:
      return {
        loading: false,
        error: null,
        isAuthenticated: false,
        token: null,
        userData: null,
      };

    case SET_SELECTED_BRANCH_IN_AUTH:
      return {
        ...state,
        userData: {
          ...state.userData,
          selectedBranch: action.payload,
        },
      };

    default:
      return state;
  }
};

export default authReducer;