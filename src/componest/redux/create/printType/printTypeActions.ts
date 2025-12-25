import axios from "axios";
import {
  CREATE_PRINT_TYPE_REQUEST,
  CREATE_PRINT_TYPE_SUCCESS,
  CREATE_PRINT_TYPE_FAIL,
  GET_PRINT_TYPES_REQUEST,
  GET_PRINT_TYPES_SUCCESS,
  GET_PRINT_TYPES_FAIL,
  GET_PRINT_TYPE_BY_ID_REQUEST,
  GET_PRINT_TYPE_BY_ID_SUCCESS,
  GET_PRINT_TYPE_BY_ID_FAIL,
  GET_PRINT_TYPES_BY_BRANCH_REQUEST,
  GET_PRINT_TYPES_BY_BRANCH_SUCCESS,
  GET_PRINT_TYPES_BY_BRANCH_FAIL,
  GET_PRINT_TYPES_BY_ORDER_TYPE_REQUEST,
  GET_PRINT_TYPES_BY_ORDER_TYPE_SUCCESS,
  GET_PRINT_TYPES_BY_ORDER_TYPE_FAIL,
  GET_DEFAULT_PRINT_TYPE_REQUEST,
  GET_DEFAULT_PRINT_TYPE_SUCCESS,
  GET_DEFAULT_PRINT_TYPE_FAIL,
  UPDATE_PRINT_TYPE_REQUEST,
  UPDATE_PRINT_TYPE_SUCCESS,
  UPDATE_PRINT_TYPE_FAIL,
  DELETE_PRINT_TYPE_REQUEST,
  DELETE_PRINT_TYPE_SUCCESS,
  DELETE_PRINT_TYPE_FAIL
} from "./printTypeConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = (getState: () => RootState): string | null => {
  const selectedBranch = getState().auth?.userData?.selectedBranch;
  if (selectedBranch) return selectedBranch;
  return localStorage.getItem("selectedBranch");
};

// Headers builder
const getHeaders = (
  token?: string | null,
  extra?: Record<string, string>
): Record<string, string> => {
  const selectedBranch = localStorage.getItem("selectedBranch");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    "x-api-key": apiKey,
    ...(extra || {}),
  };
  if (selectedBranch) {
    headers["x-selected-branch"] = selectedBranch;
  }
  return headers;
};

// Create Print Type
export const createPrintType = (printTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_PRINT_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    // Add branchId to the print type data if available
    const dataToSend = {
      ...printTypeData,
      branchId: printTypeData.branchId || branchId
    };

    const { data } = await axios.post(
      `${baseUrl}/printtype`,
      dataToSend,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_PRINT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create print type";
    dispatch({ type: CREATE_PRINT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get All Print Types
export const getPrintTypes = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_PRINT_TYPES_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/printtype?branchId=${branchId}`
      : `${baseUrl}/printtype`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    // Backend may return { data: [...] } or array directly
    const printTypes = Array.isArray(data) ? data : (data.data || data.printTypes || []);

    dispatch({ type: GET_PRINT_TYPES_SUCCESS, payload: printTypes });
    return printTypes;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch print types";
    dispatch({ type: GET_PRINT_TYPES_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Print Type by ID
export const getPrintTypeById = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_PRINT_TYPE_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/printtype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_PRINT_TYPE_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch print type";
    dispatch({ type: GET_PRINT_TYPE_BY_ID_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Print Types by Branch
export const getPrintTypesByBranch = (branchId: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_PRINT_TYPES_BY_BRANCH_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/printtype/branch/${branchId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_PRINT_TYPES_BY_BRANCH_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch print types by branch";
    dispatch({ type: GET_PRINT_TYPES_BY_BRANCH_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Print Types by Order Type
export const getPrintTypesByOrderType = (orderTypeId: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_PRINT_TYPES_BY_ORDER_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/printtype/ordertype/${orderTypeId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_PRINT_TYPES_BY_ORDER_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch print types by order type";
    dispatch({ type: GET_PRINT_TYPES_BY_ORDER_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Default Print Type
export const getDefaultPrintType = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_DEFAULT_PRINT_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/printtype/default?branchId=${branchId}`
      : `${baseUrl}/printtype/default`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_DEFAULT_PRINT_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch default print type";
    dispatch({ type: GET_DEFAULT_PRINT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Update Print Type
export const updatePrintType = (id: string, printTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRINT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/printtype/${id}`,
      printTypeData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_PRINT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update print type";
    dispatch({ type: UPDATE_PRINT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Delete Print Type
export const deletePrintType = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_PRINT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(
      `${baseUrl}/printtype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: DELETE_PRINT_TYPE_SUCCESS, payload: { id, ...data } });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete print type";
    dispatch({ type: DELETE_PRINT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};
