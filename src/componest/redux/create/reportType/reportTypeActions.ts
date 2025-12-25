import axios from "axios";
import {
  CREATE_REPORT_TYPE_REQUEST,
  CREATE_REPORT_TYPE_SUCCESS,
  CREATE_REPORT_TYPE_FAIL,
  GET_REPORT_TYPES_REQUEST,
  GET_REPORT_TYPES_SUCCESS,
  GET_REPORT_TYPES_FAIL,
  GET_REPORT_TYPE_BY_ID_REQUEST,
  GET_REPORT_TYPE_BY_ID_SUCCESS,
  GET_REPORT_TYPE_BY_ID_FAIL,
  GET_REPORT_TYPES_BY_BRANCH_REQUEST,
  GET_REPORT_TYPES_BY_BRANCH_SUCCESS,
  GET_REPORT_TYPES_BY_BRANCH_FAIL,
  GET_REPORT_TYPES_BY_CATEGORY_REQUEST,
  GET_REPORT_TYPES_BY_CATEGORY_SUCCESS,
  GET_REPORT_TYPES_BY_CATEGORY_FAIL,
  GET_DEFAULT_REPORT_TYPE_REQUEST,
  GET_DEFAULT_REPORT_TYPE_SUCCESS,
  GET_DEFAULT_REPORT_TYPE_FAIL,
  UPDATE_REPORT_TYPE_REQUEST,
  UPDATE_REPORT_TYPE_SUCCESS,
  UPDATE_REPORT_TYPE_FAIL,
  DELETE_REPORT_TYPE_REQUEST,
  DELETE_REPORT_TYPE_SUCCESS,
  DELETE_REPORT_TYPE_FAIL,
  SET_DEFAULT_REPORT_TYPE_REQUEST,
  SET_DEFAULT_REPORT_TYPE_SUCCESS,
  SET_DEFAULT_REPORT_TYPE_FAIL,
  GENERATE_REPORT_REQUEST,
  GENERATE_REPORT_SUCCESS,
  GENERATE_REPORT_FAIL,
  CLEAR_REPORT_TYPE_ERRORS,
  CLEAR_REPORT_DATA
} from "./reportTypeConstants";
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

// Create Report Type
export const createReportType = (reportTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_REPORT_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    // Add branchId to the report type data if available
    const dataToSend = {
      ...reportTypeData,
      branchId: reportTypeData.branchId || branchId
    };

    const { data } = await axios.post(
      `${baseUrl}/report-type`,
      dataToSend,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_REPORT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create report type";
    dispatch({ type: CREATE_REPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get All Report Types
export const getReportTypes = (queryParams?: { reportCategory?: string; isActive?: boolean }) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_REPORT_TYPES_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    let url = `${baseUrl}/report-type`;
    const params = new URLSearchParams();

    if (branchId) params.append('branchId', branchId);
    if (queryParams?.reportCategory) params.append('reportCategory', queryParams.reportCategory);
    if (queryParams?.isActive !== undefined) params.append('isActive', String(queryParams.isActive));

    if (params.toString()) url += `?${params.toString()}`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    // Backend may return { data: [...] } or array directly
    const reportTypes = Array.isArray(data) ? data : (data.data || data.reportTypes || []);

    dispatch({ type: GET_REPORT_TYPES_SUCCESS, payload: reportTypes });
    return reportTypes;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch report types";
    dispatch({ type: GET_REPORT_TYPES_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Report Type by ID
export const getReportTypeById = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_REPORT_TYPE_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/report-type/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_REPORT_TYPE_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch report type";
    dispatch({ type: GET_REPORT_TYPE_BY_ID_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Report Types by Branch
export const getReportTypesByBranch = (branchId: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_REPORT_TYPES_BY_BRANCH_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/report-type/branch/${branchId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_REPORT_TYPES_BY_BRANCH_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch report types by branch";
    dispatch({ type: GET_REPORT_TYPES_BY_BRANCH_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Report Types by Category
export const getReportTypesByCategory = (category: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_REPORT_TYPES_BY_CATEGORY_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/report-type/category/${category}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_REPORT_TYPES_BY_CATEGORY_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch report types by category";
    dispatch({ type: GET_REPORT_TYPES_BY_CATEGORY_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Default Report Type
export const getDefaultReportType = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_DEFAULT_REPORT_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/report-type/default?branchId=${branchId}`
      : `${baseUrl}/report-type/default`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_DEFAULT_REPORT_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch default report type";
    dispatch({ type: GET_DEFAULT_REPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Update Report Type
export const updateReportType = (id: string, reportTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_REPORT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/report-type/${id}`,
      reportTypeData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_REPORT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update report type";
    dispatch({ type: UPDATE_REPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Delete Report Type
export const deleteReportType = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_REPORT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(
      `${baseUrl}/report-type/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: DELETE_REPORT_TYPE_SUCCESS, payload: { id, ...data } });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete report type";
    dispatch({ type: DELETE_REPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Set Default Report Type
export const setDefaultReportType = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: SET_DEFAULT_REPORT_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/report-type/${id}/set-default`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: SET_DEFAULT_REPORT_TYPE_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to set default report type";
    dispatch({ type: SET_DEFAULT_REPORT_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Generate Report
export const generateReport = (id: string, filters?: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GENERATE_REPORT_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const { data } = await axios.post(
      `${baseUrl}/report-type/${id}/generate`,
      {
        filters: filters || {},
        branchId
      },
      { headers: getHeaders(token) }
    );

    dispatch({ type: GENERATE_REPORT_SUCCESS, payload: data });

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to generate report";
    dispatch({ type: GENERATE_REPORT_FAIL, payload: errorMessage });
    throw error;
  }
};

// Clear Errors
export const clearReportTypeErrors = () => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_REPORT_TYPE_ERRORS });
};

// Clear Report Data
export const clearReportData = () => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_REPORT_DATA });
};
