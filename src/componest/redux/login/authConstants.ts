// authConstants.ts
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGOUT = "LOGOUT";

export interface UserData {
  id: string;
  name: string;
  // add any other common user fields
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  userData: UserData | null;
}