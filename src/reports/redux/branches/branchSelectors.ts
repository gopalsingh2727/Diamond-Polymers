/**
 * Branch Redux Selectors
 * Selectors for accessing branch state
 */

import { RootState } from '../rootReducer';
import { Branch } from './branchTypes';

// Get all branches
export const selectBranches = (state: RootState): Branch[] => 
  state.branches.branches;

// Get selected branch ID
export const selectSelectedBranchId = (state: RootState): string | null => 
  state.branches.selectedBranchId;

// Get selected branch object
export const selectSelectedBranch = (state: RootState): Branch | null => {
  const { branches, selectedBranchId } = state.branches;
  if (!selectedBranchId) return null;
  return branches.find(b => b.id === selectedBranchId) || null;
};

// Get active branches only
export const selectActiveBranches = (state: RootState): Branch[] => 
  state.branches.branches.filter(b => b.isActive);

// Get branches by region
export const selectBranchesByRegion = (state: RootState, region: string): Branch[] => 
  state.branches.branches.filter(b => b.region === region);

// Get branch loading state
export const selectBranchLoading = (state: RootState): boolean => 
  state.branches.loading;

// Get branch error
export const selectBranchError = (state: RootState): string | null => 
  state.branches.error;

// Get all unique regions
export const selectRegions = (state: RootState): string[] => {
  const regions = state.branches.branches.map(b => b.region);
  return Array.from(new Set(regions)).sort();
};

// Check if "All Branches" is selected
export const selectIsAllBranchesSelected = (state: RootState): boolean => 
  state.branches.selectedBranchId === null;

// Get branch by ID
export const selectBranchById = (state: RootState, branchId: string): Branch | undefined => 
  state.branches.branches.find(b => b.id === branchId);

// Get branch statistics
export const selectBranchStats = (state: RootState) => {
  const branches = state.branches.branches;
  return {
    total: branches.length,
    active: branches.filter(b => b.isActive).length,
    inactive: branches.filter(b => !b.isActive).length,
    totalMachines: branches.reduce((sum, b) => sum + b.machineCount, 0),
    totalEmployees: branches.reduce((sum, b) => sum + b.employeeCount, 0),
  };
};
