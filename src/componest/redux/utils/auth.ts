// utils/auth.ts
export const getAuthToken = () => localStorage.getItem("authToken");
export const getUserData = () => JSON.parse(localStorage.getItem("userData") || "null");
export const getBranchId = () => localStorage.getItem("selectedBranch");

// Check if JWT token is expired by decoding the payload
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    // JWT structure: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp;

    if (!exp) return false; // No expiration = never expires

    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= exp * 1000;
  } catch {
    return true; // If we can't decode, assume expired
  }
};

// Check if token exists AND is not expired
export const isTokenValid = (): boolean => {
  const token = getAuthToken();
  return !!token && !isTokenExpired(token);
};

// Clear all auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("selectedBranch");
  localStorage.removeItem("branchId");
};


export const validateBranchOrRedirect = () => {
  const token = getAuthToken();
  const branchId = getBranchId();

  if (token && !branchId) {
    // Clear bad session
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("selectedBranch");

    // Optional: show a toast before redirecting
    window.location.href = "/login";
    return false;
  }
  return true;
};