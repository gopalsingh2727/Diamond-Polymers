// Updated BranchActions.ts - Fixed for both Admin and Manager

import axios from "axios";
import { AppDispatch, RootState } from "../../../store";

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
  console.log("=== STORING BRANCH ID ===");
  console.log("Branch ID to store:", branchId);
  console.log("User data:", userData);

  try {
    // Store in multiple places for compatibility
    localStorage.setItem("selectedBranch", branchId);
    localStorage.setItem("branchId", branchId);
    localStorage.setItem("selectedBranchId", branchId);

    // Update userData with selected branch
    const updatedUserData = {
      ...userData,
      selectedBranch: branchId,
    };
    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    console.log("✅ Branch ID stored successfully");
    console.log("Updated localStorage userData:", localStorage.getItem("userData"));
    console.log("selectedBranch:", localStorage.getItem("selectedBranch"));
    console.log("=== END STORING BRANCH ID ===");
  } catch (error) {
    console.error("❌ Error storing branch ID:", error);
  }
};

// Fetch Branches - Fixed for both Admin and Manager
export const fetchBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FETCH_BRANCHES_REQUEST });

    try {
      const token = getToken(getState);
      const userData = getUserData(getState);
      const role = userData?.role;

      console.log("=== FETCHING BRANCHES ===");
      console.log("User role:", role);
      console.log("User data:", userData);

      let url = "";
      let branches: any[] = [];
      let branchId: string | null = null;

      if (role === "admin") {
        url = `${baseUrl}/branch/branches`;
        
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": API_KEY,
          },
        });

        console.log("Admin API Response:", data);

        // ✅ Extract branches array from response
        branches = data.branches || data || [];
        
        // ✅ Ensure branches is an array
        if (!Array.isArray(branches)) {
          console.error("❌ Invalid branches data:", branches);
          branches = [];
        }

        console.log(`✅ Found ${branches.length} branches for admin`);

        // Get first branch ID if available
        if (branches.length > 0) {
          branchId = branches[0]._id || branches[0].id;
          console.log("Admin default branch ID:", branchId);
        }

      } else if (role === "manager") {
        url = `${baseUrl}/manager/getMyBranch`;
        
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": API_KEY,
          },
        });

        console.log("Manager API Response:", data);

        // ✅ For manager, wrap single branch in array
        branches = [data];
        branchId = data.branchId || data._id || data.id;
        
        console.log("Manager branch ID:", branchId);

      } else {
        throw new Error("Unauthorized role");
      }

      console.log("Branches to dispatch:", branches);

      // ✅ Dispatch branches array (always an array)
      dispatch({ 
        type: FETCH_BRANCHES_SUCCESS, 
        payload: branches 
      });

      // ✅ Store branch ID if found
      if (branchId) {
        console.log("Storing branch ID:", branchId);
        storeBranchId(branchId, userData);
      } else {
        console.warn("⚠️ No branch ID found in response");
      }

      console.log("=== END FETCHING BRANCHES ===");

    } catch (error: any) {
      console.error("❌ Fetch branches error:", error);
      dispatch({
        type: FETCH_BRANCHES_FAIL,
        payload: error?.response?.data?.message || "Failed to fetch branches",
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

      const { data } = await axios.post(
        `${baseUrl}/branch/selectBranch`,
        { branchId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": API_KEY,
          },
        }
      );

      dispatch({ type: SELECT_BRANCH_SUCCESS, payload: data });

      const userData = getUserData(getState);
      storeBranchId(branchId, userData);
    
    } catch (error: any) {
      dispatch({
        type: SELECT_BRANCH_FAIL,
        payload: error?.response?.data?.message || "Branch selection failed",
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

      const { data } = await axios.get(`${baseUrl}/branch/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      });

      console.log("List branches response:", data);

      // ✅ Extract branches array
      const branches = data.branches || data || [];

      dispatch({ 
        type: BRANCH_LIST_SUCCESS, 
        payload: branches 
      });

    } catch (error: any) {
      dispatch({
        type: BRANCH_LIST_FAIL,
        payload: error?.response?.data?.message || "Failed to list branches",
      });
    }
  };
};