import axios from "axios";
import {
  CREATE_EXCEL_EXPORT_TYPE_REQUEST,
  CREATE_EXCEL_EXPORT_TYPE_SUCCESS,
  CREATE_EXCEL_EXPORT_TYPE_FAIL,
  GET_EXCEL_EXPORT_TYPES_REQUEST,
  GET_EXCEL_EXPORT_TYPES_SUCCESS,
  GET_EXCEL_EXPORT_TYPES_FAIL,
  GET_EXCEL_EXPORT_TYPE_BY_ID_REQUEST,
  GET_EXCEL_EXPORT_TYPE_BY_ID_SUCCESS,
  GET_EXCEL_EXPORT_TYPE_BY_ID_FAIL,
  GET_EXCEL_EXPORT_TYPES_BY_BRANCH_REQUEST,
  GET_EXCEL_EXPORT_TYPES_BY_BRANCH_SUCCESS,
  GET_EXCEL_EXPORT_TYPES_BY_BRANCH_FAIL,
  GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_REQUEST,
  GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_SUCCESS,
  GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_FAIL,
  GET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST,
  GET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS,
  GET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL,
  UPDATE_EXCEL_EXPORT_TYPE_REQUEST,
  UPDATE_EXCEL_EXPORT_TYPE_SUCCESS,
  UPDATE_EXCEL_EXPORT_TYPE_FAIL,
  DELETE_EXCEL_EXPORT_TYPE_REQUEST,
  DELETE_EXCEL_EXPORT_TYPE_SUCCESS,
  DELETE_EXCEL_EXPORT_TYPE_FAIL,
  SET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST,
  SET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS,
  SET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL
} from "./excelExportTypeConstants";
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

// Create Excel Export Type
export const createExcelExportType = (exportTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_EXCEL_EXPORT_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    // Add branchId to the export type data if available
    const dataToSend = {
      ...exportTypeData,
      branchId: exportTypeData.branchId || branchId
    };

    const { data } = await axios.post(
      `${baseUrl}/excelexporttype`,
      dataToSend,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_EXCEL_EXPORT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create excel export type";
    dispatch({ type: CREATE_EXCEL_EXPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get All Excel Export Types
export const getExcelExportTypes = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_EXCEL_EXPORT_TYPES_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/excelexporttype?branchId=${branchId}`
      : `${baseUrl}/excelexporttype`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    // Backend may return { data: [...] } or array directly
    const excelTypes = Array.isArray(data) ? data : (data.data || data.excelExportTypes || []);

    dispatch({ type: GET_EXCEL_EXPORT_TYPES_SUCCESS, payload: excelTypes });
    return excelTypes;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch excel export types";
    dispatch({ type: GET_EXCEL_EXPORT_TYPES_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Excel Export Type by ID
export const getExcelExportTypeById = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_EXCEL_EXPORT_TYPE_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/excelexporttype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_EXCEL_EXPORT_TYPE_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch excel export type";
    dispatch({ type: GET_EXCEL_EXPORT_TYPE_BY_ID_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Excel Export Types by Branch
export const getExcelExportTypesByBranch = (branchId: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_EXCEL_EXPORT_TYPES_BY_BRANCH_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/excelexporttype/branch/${branchId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_EXCEL_EXPORT_TYPES_BY_BRANCH_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch excel export types by branch";
    dispatch({ type: GET_EXCEL_EXPORT_TYPES_BY_BRANCH_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Excel Export Types by Option Type
export const getExcelExportTypesByOptionType = (optionTypeId: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/excelexporttype/optiontype/${optionTypeId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch excel export types by option type";
    dispatch({ type: GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Default Excel Export Type
export const getDefaultExcelExportType = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/excelexporttype/default?branchId=${branchId}`
      : `${baseUrl}/excelexporttype/default`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch default excel export type";
    dispatch({ type: GET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Update Excel Export Type
export const updateExcelExportType = (id: string, exportTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_EXCEL_EXPORT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/excelexporttype/${id}`,
      exportTypeData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_EXCEL_EXPORT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update excel export type";
    dispatch({ type: UPDATE_EXCEL_EXPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Delete Excel Export Type
export const deleteExcelExportType = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_EXCEL_EXPORT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(
      `${baseUrl}/excelexporttype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: DELETE_EXCEL_EXPORT_TYPE_SUCCESS, payload: { id, ...data } });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete excel export type";
    dispatch({ type: DELETE_EXCEL_EXPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Set Default Excel Export Type
export const setDefaultExcelExportType = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: SET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/excelexporttype/${id}/set-default`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: SET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to set default excel export type";
    dispatch({ type: SET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};
