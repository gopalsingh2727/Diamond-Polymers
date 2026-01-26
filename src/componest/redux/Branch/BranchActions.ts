// Updated BranchActions.ts - Fixed for both Admin and Manager

import axios from "axios";
import { AppDispatch, RootState } from "../../../store";
import { getOrderFormDataIfNeeded } from "../oders/orderFormDataActions";

export const FETCH_BRANCHES_REQUEST = "FETCH_BRANCHES_REQUEST";
export const FETCH_BRANCHES_SUCCESS = "FETCH_BRANCHES_SUCCESS";
export const FETCH_BRANCHES_FAIL = "FETCH_BRANCHES_FAIL";

export const BRANCH_LIST_REQUEST = "BRANCH_LIST_REQUEST";
export const BRANCH_LIST_SUCCESS = "BRANCH_LIST_SUCCESS";
export const BRANCH_LIST_FAIL = "BRANCH_LIST_FAIL";

// Add new branch to list (used after creating a branch)
export const ADD_BRANCH_TO_LIST = "ADD_BRANCH_TO_LIST";

// Environment Variables
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Helpers
const getToken = (getState: () => RootState): string | null => {
  return getState().auth?.token || localStorage.getItem("authToken");
};

const getUserData = (getState: () => RootState): any => {
  return getState().auth?.userData || JSON.parse(localStorage.getItem("userData") || "{}");
};

// Fixed: Proper branch ID storage function
const storeBranchId = (branchId: string, userData: any) => {
  try {
    // Store in multiple places for compatibility
    localStorage.setItem("selectedBranch", branchId);
    localStorage.setItem("branchId", branchId);
    localStorage.setItem("selectedBranchId", branchId);

    // Update userData with selected branch
    const updatedUserData = {
      ...userData,
      selectedBranch: branchId
    };
    localStorage.setItem("userData", JSON.stringify(updatedUserData));

  } catch (error) {

  }
};

// ✅ NEW: Check if branches are cached and valid
const areBranchesCached = (): boolean => {
  try {
    const cached = localStorage.getItem('cached_branches');
    if (cached) {
      const parsed = JSON.parse(cached);
      // ✅ FIXED: If cached branches is empty, clear cache and return false
      if (!parsed.branches || parsed.branches.length === 0) {
        console.warn('⚠️ Cached branches is empty, clearing cache');
        localStorage.removeItem('cached_branches');
        return false;
      }
      console.log('✅ Found cached branches:', parsed.branches.length);
      return true;
    }
  } catch (error) {
    console.error('Failed to check branch cache:', error);
    localStorage.removeItem('cached_branches');
  }
  return false;
};

// ✅ NEW: Fetch branches only if not cached
export const fetchBranchesIfNeeded = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    // Check if branches are already in Redux state
    const state = getState();
    const branchesInState = state.branches?.branches || [];

    // If branches exist in state, don't fetch
    if (branchesInState.length > 0) {
      console.log('✅ Branches already in state, skipping API call');
      return;
    }

    // Check if branches are cached in localStorage
    if (areBranchesCached()) {
      console.log('✅ Branches found in cache, skipping API call');
      return;
    }

    // No cache, fetch from API
    console.log('🔄 No cached branches, fetching from API');
    return dispatch(fetchBranches());
  };
};

// ✅ FIXED: Use branches from login response (no API call needed)
export const fetchBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FETCH_BRANCHES_REQUEST });

    try {
      const userData = getUserData(getState);

      // ✅ Get branches from auth state (already loaded from login response)
      const branches = userData?.branches || [];
      let branchId: string | null = null;

      console.log('✅ Using branches from login response:', branches.length, 'branches');

      // ✅ Ensure branches is an array
      if (!Array.isArray(branches)) {
        console.warn('⚠️ Branches is not an array, using empty array');
        dispatch({
          type: FETCH_BRANCHES_SUCCESS,
          payload: []
        });
        return;
      }

      // ✅ Dispatch branches array (already from login response)
      console.log('🚀 Dispatching FETCH_BRANCHES_SUCCESS with', branches.length, 'branches');
      dispatch({
        type: FETCH_BRANCHES_SUCCESS,
        payload: branches
      });
      console.log('✅ Branches dispatched to Redux successfully');

      // ✅ Get first branch ID if available
      if (branches.length > 0) {
        branchId = branches[0]._id || branches[0].id;
        console.log('✅ First branch ID:', branchId);
      } else {
        console.warn('⚠️ No branches available to select');
      }

      // ✅ Store branch ID if found
      if (branchId) {
        storeBranchId(branchId, userData);

        // ✅ Fetch form data after branch is selected (uses cache if available)
        try {
          await dispatch(getOrderFormDataIfNeeded() as any);
        } catch (error) {
          // Silent fail for form data
        }
      }

    } catch (error: any) {
      console.error('❌ ERROR loading branches from auth state:', error);
      dispatch({
        type: FETCH_BRANCHES_FAIL,
        payload: error?.message || "Failed to load branches from state"
      });
    }
  };
};

// ✅ NEW: List branches only if not already loaded (prevents repeated API calls)
export const listBranchesIfNeeded = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const branchesInState = state.branchList?.branches || [];

    // 1. If branches already exist in Redux state, skip
    if (branchesInState.length > 0) {
      console.log('✅ Branches already in Redux, skipping API call');
      return;
    }

    // 2. Check localStorage cache (no expiration - cleared only on create/update/delete)
    try {
      const cached = localStorage.getItem('branchList_cache');
      if (cached) {
        const { branches } = JSON.parse(cached);
        if (branches && branches.length > 0) {
          console.log('✅ Loading branches from localStorage cache');
          dispatch({
            type: BRANCH_LIST_SUCCESS,
            payload: branches
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to read branch cache:', e);
    }

    // 3. No cache, fetch from API
    console.log('🔄 No cached branches, fetching from API');
    return dispatch(listBranches());
  };
};

// List All Branches - V2 endpoint
export const listBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: BRANCH_LIST_REQUEST });

    try {
      const token = getToken(getState);

      const selectedBranch = localStorage.getItem("selectedBranch");
      const listHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "x-api-key": API_KEY
      };
      if (selectedBranch) {
        listHeaders["x-selected-branch"] = selectedBranch;
      }

      // ✅ Updated to use V2 endpoint
      const { data } = await axios.get(`${baseUrl}/v2/branch`, {
        headers: listHeaders
      });

      // ✅ Extract branches array from V2 response
      const branches = data.data?.data || data.data || data.branches || data || [];

      // ✅ Save to localStorage cache after successful API call
      try {
        localStorage.setItem('branchList_cache', JSON.stringify({
          branches,
          timestamp: Date.now()
        }));
        console.log('✅ Branches saved to localStorage cache');
      } catch (e) {
        console.warn('Failed to cache branches:', e);
      }

      dispatch({
        type: BRANCH_LIST_SUCCESS,
        payload: branches
      });

    } catch (error: any) {
      dispatch({
        type: BRANCH_LIST_FAIL,
        payload: error?.response?.data?.message || "Failed to list branches"
      });
    }
  };
};

// ✅ Clear branch cache (call after creating/updating/deleting a branch)
export const clearBranchCache = () => {
  localStorage.removeItem('branchList_cache');
  console.log('🗑️ Branch cache cleared');
};