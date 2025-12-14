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
 * Returns headers with token, api key, and selected branch.
 * IMPORTANT: x-selected-branch is ALWAYS included for proper branch-based data filtering
 * If branchId is not provided, it's automatically fetched from localStorage
 */
export const getHeaders = (token?: string, branchId?: string | boolean, role?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Auto-fetch branchId from localStorage if not provided
  // Handle legacy calls where second param might be boolean
  const selectedBranch = typeof branchId === 'string'
    ? branchId
    : getBranchId();

  // Include x-selected-branch for ALL authenticated users
  // Backend uses this to filter data by branch
  if (selectedBranch) {
    headers["x-selected-branch"] = selectedBranch;
  }

  return headers;
};

export { baseUrl };