import { RootState } from "../rootReducer";

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Safely retrieves the token from Redux state or localStorage.
 */
export const getToken = (getState: () => RootState): string | undefined => {
  return getState().auth?.token || localStorage.getItem("authToken") || undefined;
};

/**
 * Safely retrieves the current branchId.
 */
export const getBranchId = (): string | undefined => {
  return localStorage.getItem("selectedBranch") || undefined;
};

/**
 * Retrieves userData object from Redux or localStorage.
 */
export const getUserData = (getState: () => RootState): any => {
  return getState().auth?.userData || JSON.parse(localStorage.getItem("userData") || "{}");
};

/**
 * Returns headers with token, api key, and optional x-branch-id if Admin.
 */
export const getHeaders = (token?: string, branchId?: string, role?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only include x-branch-id if user is an admin and branchId is available
  if (role === "admin" && branchId) {
    headers["x-branch-id"] = branchId;
  }

  return headers;
};

export { baseUrl };