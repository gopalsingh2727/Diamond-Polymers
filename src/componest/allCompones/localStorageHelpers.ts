export const setSelectedBranchId = (branchId: string, userData?: any) => {
  localStorage.setItem("selectedBranch", branchId);
  if (userData) {
    localStorage.setItem("userData", JSON.stringify({ ...userData, selectedBranch: branchId }));
  }
};