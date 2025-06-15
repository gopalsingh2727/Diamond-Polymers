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

// Fetch Branches
export const fetchBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FETCH_BRANCHES_REQUEST });

    try {
      const token = getToken(getState);
      const userData = getUserData(getState);
      const role = userData?.role;

      let url = "";
      if (role === "admin") {
        url = `${baseUrl}/branch/branches`;
      } else if (role === "manager") {
        url = `${baseUrl}/manager/getMyBranch`;
      } else {
        throw new Error("Unauthorized role");
      }

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      });

      const branches = role === "manager" ? [data] : data;

      if (role === "manager" && data?._id) {
        localStorage.setItem("userData", JSON.stringify({ ...userData, selectedBranch: data._id }));
      }

      const branchId = role === "manager" ? data.branchId : data[0]?._id;
      if (branchId) {
        localStorage.setItem("selectedBranch", branchId);
      }

      dispatch({ type: FETCH_BRANCHES_SUCCESS, payload: branches });

    } catch (error: any) {
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
      localStorage.setItem("userData", JSON.stringify({ ...userData, selectedBranch: branchId }));

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

      dispatch({ type: BRANCH_LIST_SUCCESS, payload: data });

    } catch (error: any) {
      dispatch({
        type: BRANCH_LIST_FAIL,
        payload: error?.response?.data?.message || "Failed to list branches",
      });
    }
  };
};