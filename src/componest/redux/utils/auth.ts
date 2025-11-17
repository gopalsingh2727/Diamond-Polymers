// utils/auth.ts
export const getAuthToken = () => localStorage.getItem("authToken");
export const getUserData = () => JSON.parse(localStorage.getItem("userData") || "null");
export const getBranchId = () => localStorage.getItem("selectedBranch");


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