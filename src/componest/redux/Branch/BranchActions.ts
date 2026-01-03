// Updated BranchActions.ts - Fixed for both Admin and Manager

import axios from "axios";
import { AppDispatch, RootState } from "../../../store";
import { getOrderFormDataIfNeeded } from "../oders/orderFormDataActions";

export const FETCH_BRANCHES_REQUEST = "FETCH_BRANCHES_REQUEST";
export const FETCH_BRANCHES_SUCCESS = "FETCH_BRANCHES_SUCCESS";
export const FETCH_BRANCHES_FAIL = "FETCH_BRANCHES_FAIL";

export const SELECT_BRANCH_REQUEST = "SELECT_BRANCH_REQUEST";
export const SELECT_BRANCH_SUCCESS = "SELECT_BRANCH_SUCCESS";
export const SELECT_BRANCH_FAIL = "SELECT_BRANCH_FAIL";

export const BRANCH_LIST_REQUEST = "BRANCH_LIST_REQUEST";
export const BRANCH_LIST_SUCCESS = "BRANCH_LIST_SUCCESS";
export const BRANCH_LIST_FAIL = "BRANCH_LIST_FAIL";

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

// Fetch Branches - Fixed for both Admin and Manager
export const fetchBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FETCH_BRANCHES_REQUEST });

    try {
      const token = getToken(getState);
      const userData = getUserData(getState);
      const role = userData?.role;

      let url = "";
      let branches: any[] = [];
      let branchId: string | null = null;

      if (role === "admin" || role === "master_admin") {
        url = `${baseUrl}/branch/branches`;

        const selectedBranch = localStorage.getItem("selectedBranch");
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY
        };
        if (selectedBranch) {
          headers["x-selected-branch"] = selectedBranch;
        }

        const { data } = await axios.get(url, { headers });

        console.log('🔍 Branch API Response:', data);
        console.log('🔍 Response type:', typeof data);
        console.log('🔍 Is Array?:', Array.isArray(data));

        // ✅ Extract branches array from response
        branches = data.branches || data || [];

        // ✅ Ensure branches is an array
        if (!Array.isArray(branches)) {
          console.warn('⚠️ Branches is not an array, converting to empty array');
          branches = [];
        }

        console.log('✅ Final branches array:', branches);
        console.log('✅ Branches count:', branches.length);

        if (branches.length === 0) {
          console.error('❌ ERROR: Branches array is empty after processing!');
        }

        // Get first branch ID if available
        if (branches.length > 0) {
          branchId = branches[0]._id || branches[0].id;
          console.log('✅ First branch ID:', branchId);
        } else {
          console.warn('⚠️ No branches available to select');
        }

      } else if (role === "manager") {
        url = `${baseUrl}/manager/getMyBranch`;

        const selectedBranch = localStorage.getItem("selectedBranch");
        const mgrHeaders: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY
        };
        if (selectedBranch) {
          mgrHeaders["x-selected-branch"] = selectedBranch;
        }

        const { data } = await axios.get(url, { headers: mgrHeaders });

        // ✅ For manager, wrap single branch in array
        branches = [data];
        branchId = data.branchId || data._id || data.id;

      } else {
        throw new Error("Unauthorized role");
      }

      // ✅ Dispatch branches array (always an array)
      console.log('🚀 Dispatching FETCH_BRANCHES_SUCCESS with', branches.length, 'branches');
      dispatch({
        type: FETCH_BRANCHES_SUCCESS,
        payload: branches
      });
      console.log('✅ Branches dispatched to Redux successfully');

      // ✅ Store branch ID if found
      if (branchId) {

        storeBranchId(branchId, userData);

        // ✅ Fetch form data after branch is selected (uses cache if available)
        try {
          await dispatch(getOrderFormDataIfNeeded() as any);
        } catch (error) {

        }
      } else {

      }

    } catch (error: any) {
      console.error('❌ ERROR fetching branches:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      dispatch({
        type: FETCH_BRANCHES_FAIL,
        payload: error?.response?.data?.message || "Failed to fetch branches"
      });
    }
  };
};

// Select Branch
export const selectBranch = (branchId: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: SELECT_BRANCH_REQUEST });

    try {
      const token = getToken(getState);

      const selectedBranch = localStorage.getItem("selectedBranch");
      const selectHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      };
      if (selectedBranch) {
        selectHeaders["x-selected-branch"] = selectedBranch;
      }

      const { data } = await axios.post(
        `${baseUrl}/branch/selectBranch`,
        { branchId },
        { headers: selectHeaders }
      );

      dispatch({ type: SELECT_BRANCH_SUCCESS, payload: data });

      const userData = getUserData(getState);
      storeBranchId(branchId, userData);

      // ✅ Fetch form data after branch is selected (uses cache if available)
      try {
        await dispatch(getOrderFormDataIfNeeded() as any);
      } catch (error) {

      }

    } catch (error: any) {
      dispatch({
        type: SELECT_BRANCH_FAIL,
        payload: error?.response?.data?.message || "Branch selection failed"
      });
    }
  };
};

// List All Branches (Admin)
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

      const { data } = await axios.get(`${baseUrl}/branch/branches`, {
        headers: listHeaders
      });

      // ✅ Extract branches array
      const branches = data.branches || data || [];

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