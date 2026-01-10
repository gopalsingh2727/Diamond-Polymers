import axios from "axios";
import {
  BRANCH_CREATE_REQUEST,
  BRANCH_CREATE_SUCCESS,
  BRANCH_CREATE_FAIL,
  BRANCH_LIST_REQUEST,
  BRANCH_LIST_SUCCESS,
  BRANCH_LIST_FAIL,
  BRANCH_UPDATE_REQUEST,
  BRANCH_UPDATE_SUCCESS,
  BRANCH_UPDATE_FAIL,
  BRANCH_DELETE_REQUEST,
  BRANCH_DELETE_SUCCESS,
  BRANCH_DELETE_FAIL,
} from "./branchConstants";
import { AppDispatch, RootState } from "../../../store";
import { addBranchToAuth } from "../login/authActions";

// Helpers
const getToken = (getState: () => RootState): string | null => {
  return getState().auth?.token || localStorage.getItem("authToken");
};

const getHeaders = (token: string | null) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  const selectedBranch = localStorage.getItem("selectedBranch");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    "x-api-key": apiKey,
  };

  // ✅ CRITICAL FIX: Add x-selected-branch header for multi-branch users
  if (selectedBranch) {
    headers["x-selected-branch"] = selectedBranch;
  }

  return headers;
};

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;

// ─── CREATE ───────────────────────────────────────────────
export const createBranch = (data: {
  name: string;
  location: string;
  code: string;
  phone?: string;
  email?: string;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: BRANCH_CREATE_REQUEST });

      const token = getToken(getState);

      if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
        throw new Error("Branch name is required and must be a string.");
      }

      if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
        throw new Error("Branch code is required.");
      }

      const payload = {
        name: data.name.trim(),
        location: data.location?.trim() || "",
        code: data.code.trim(),
        phone: data.phone?.trim() || "",
        email: data.email?.trim() || "",
      };

      const response = await axios.post(
        `${baseUrl}/v2/branch`,
        payload,
        { headers: getHeaders(token) }
      );

      dispatch({
        type: BRANCH_CREATE_SUCCESS,
        payload: response.data,
      });

      // Update user's branches in Redux state and localStorage
      const newBranch = response.data.branch;
      if (newBranch?._id) {
        dispatch(addBranchToAuth(newBranch) as any);
      }

      return response.data;

    } catch (error: any) {
      dispatch({
        type: BRANCH_CREATE_FAIL,
        payload:
          error.response?.data?.message || error.message || "Branch creation failed",
      });
      throw error;
    }
  };
};

// ─── LIST ───────────────────────────────────────────────
export const listBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: BRANCH_LIST_REQUEST });

      const token = getToken(getState);

      const { data } = await axios.get(`${baseUrl}/v2/branch`, {
        headers: getHeaders(token),
      });

      const branches = data.data?.data || data.data || data.branches || data;
      dispatch({ type: BRANCH_LIST_SUCCESS, payload: branches });

    } catch (error: any) {
      dispatch({
        type: BRANCH_LIST_FAIL,
        payload: error.response?.data?.message || "Failed to fetch branches",
      });
    }
  };
};

// ─── UPDATE ───────────────────────────────────────────────
export const updateBranch = (branchId: string, data: { name?: string; location?: string }) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: BRANCH_UPDATE_REQUEST });

      const token = getToken(getState);

      const payload = {
        ...(data.name && { name: data.name.trim() }),
        ...(data.location && { location: data.location.trim() }),
      };

      const response = await axios.put(
        `${baseUrl}/v2/branch/${branchId}`,
        payload,
        { headers: getHeaders(token) }
      );

      dispatch({ type: BRANCH_UPDATE_SUCCESS, payload: response.data });

    } catch (error: any) {
      dispatch({
        type: BRANCH_UPDATE_FAIL,
        payload: error.response?.data?.message || "Failed to update branch",
      });
    }
  };
};

// ─── DELETE ───────────────────────────────────────────────
export const deleteBranch = (branchId: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: BRANCH_DELETE_REQUEST });

      const token = getToken(getState);

      await axios.delete(`${baseUrl}/v2/branch/${branchId}`, {
        headers: getHeaders(token),
      });

      dispatch({ type: BRANCH_DELETE_SUCCESS, payload: branchId });

    } catch (error: any) {
      dispatch({
        type: BRANCH_DELETE_FAIL,
        payload: error.response?.data?.message || "Failed to delete branch",
      });
    }
  };
};