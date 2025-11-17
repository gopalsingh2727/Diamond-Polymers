// Debug utility to check authentication status
// Run in browser console: import('./src/componest/redux/reports/reports/debugAuth').then(m => m.checkAuthStatus())

export const checkAuthStatus = () => {
  console.log("=== Authentication Status ===");

  const token = localStorage.getItem("authToken");
  const branchId = localStorage.getItem("selectedBranch");

  console.log("Has token:", !!token);
  console.log("Token length:", token?.length || 0);
  console.log("Token preview:", token ? `${token.substring(0, 20)}...` : "null");

  if (token) {
    const parts = token.split('.');
    console.log("Token parts:", parts.length);
    console.log("Is valid JWT format:", parts.length === 3);

    // Try to decode JWT payload
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);

        // Check expiration
        if (payload.exp) {
          const expirationDate = new Date(payload.exp * 1000);
          const now = new Date();
          const isExpired = expirationDate < now;

          console.log("Token expiration:", expirationDate.toLocaleString());
          console.log("Is expired:", isExpired);
          console.log("Time until expiration:", isExpired ? "EXPIRED" : `${Math.floor((expirationDate.getTime() - now.getTime()) / 1000 / 60)} minutes`);
        }
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }

  console.log("\nBranch ID:", branchId);
  console.log("Viewing all branches:", !branchId || branchId === "all" || branchId === "null");

  console.log("\nAPI Configuration:");
  console.log("Base URL:", import.meta.env.VITE_API_27INFINITY_IN);
  console.log("API Key set:", !!import.meta.env.VITE_API_KEY);

  console.log("============================");

  return {
    hasToken: !!token,
    tokenValid: token ? token.split('.').length === 3 : false,
    branchId,
    baseUrl: import.meta.env.VITE_API_27INFINITY_IN,
    hasApiKey: !!import.meta.env.VITE_API_KEY
  };
};

// Also expose globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).checkAuthStatus = checkAuthStatus;
}
