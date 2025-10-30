/**
 * Branch Redux Actions
 * Action creators for branch management
 */

import {
  Branch,
  BRANCH_ACTION_TYPES,
  SetBranchesAction,
  SetSelectedBranchAction,
  SetLoadingAction,
  SetErrorAction,
  ClearErrorAction,
} from './branchTypes';

// Action Creators
export const setBranches = (branches: Branch[]): SetBranchesAction => ({
  type: BRANCH_ACTION_TYPES.SET_BRANCHES,
  payload: branches,
});

export const setSelectedBranch = (branchId: string | null): SetSelectedBranchAction => ({
  type: BRANCH_ACTION_TYPES.SET_SELECTED_BRANCH,
  payload: branchId,
});

export const setLoading = (loading: boolean): SetLoadingAction => ({
  type: BRANCH_ACTION_TYPES.SET_LOADING,
  payload: loading,
});

export const setError = (error: string): SetErrorAction => ({
  type: BRANCH_ACTION_TYPES.SET_ERROR,
  payload: error,
});

export const clearError = (): ClearErrorAction => ({
  type: BRANCH_ACTION_TYPES.CLEAR_ERROR,
});

// Thunk Actions (for async operations)
export const loadBranches = () => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/branches');
      // const branches = await response.json();
      
      // For now, use mock data
      const { mockBranches } = await import('../../lib/mockBranches');
      
      dispatch(setBranches(mockBranches));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load branches';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const changeBranch = (branchId: string | null) => {
  return async (dispatch: any) => {
    try {
      dispatch(setSelectedBranch(branchId));
      
      // You might want to trigger data refresh when branch changes
      // dispatch(refreshReportData());
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change branch';
      dispatch(setError(errorMessage));
    }
  };
};
