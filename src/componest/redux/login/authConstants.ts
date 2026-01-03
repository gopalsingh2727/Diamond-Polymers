// authConstants.ts
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGOUT = "LOGOUT";
export const LOGIN_REQUIRES_VERIFICATION = "LOGIN_REQUIRES_VERIFICATION";
export const CLEAR_VERIFICATION_STATE = "CLEAR_VERIFICATION_STATE";
export const CLEAR_BRANCH_DATA = "CLEAR_BRANCH_DATA";
export const BRANCH_SWITCHING = "BRANCH_SWITCHING";
export const BRANCH_SWITCH_COMPLETE = "BRANCH_SWITCH_COMPLETE";

export interface Branch {
  _id: string;
  name: string;
  code?: string;
  location?: string;
  phone?: string;
  email?: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: 'master_admin' | 'admin' | 'manager';
  branchId?: string;
  branchIds?: string[];
  product27InfinityId?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
  emailVerified?: boolean;
  lastLogin?: string;
  branches?: Branch[];
  selectedBranch?: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  userData: UserData | null;
  requiresVerification?: boolean;
  verificationEmail?: string;
  verificationUserType?: 'admin' | 'manager' | 'master_admin';
  tokenRefreshing?: boolean;
}