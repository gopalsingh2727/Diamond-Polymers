import axios from "axios";
import { Dispatch } from "redux";
import { RootState } from "../rootReducer";

// Action Types
export const GET_ORDER_FORM_DATA_REQUEST = "GET_ORDER_FORM_DATA_REQUEST";
export const GET_ORDER_FORM_DATA_SUCCESS = "GET_ORDER_FORM_DATA_SUCCESS";
export const GET_ORDER_FORM_DATA_FAIL = "GET_ORDER_FORM_DATA_FAIL";
export const CLEAR_ORDER_FORM_DATA = "CLEAR_ORDER_FORM_DATA";
export const REFRESH_ORDER_FORM_DATA = "REFRESH_ORDER_FORM_DATA";

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
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(extra || {}),
});


export const getOrderFormData = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_ORDER_FORM_DATA_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    // Single API call to get ALL data
    const { data } = await axios.get(`${baseUrl}/order/form-data`, {
      headers: getHeaders(token),
      params: { branchId },
    });

    console.log("📊 Received form data:", data);

    // Extract the actual data from the response
    const formData = data.data || data;

    dispatch({
      type: GET_ORDER_FORM_DATA_SUCCESS,
      payload: formData
    });

    return formData;
  } catch (error: any) {
    dispatch({
      type: GET_ORDER_FORM_DATA_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Get data for specific product type (when user selects a product type)
 * This fetches only the products and specs for that type
 */
export const getProductTypeData = (productTypeId: string) => async () => {
  try {
    // Get token from localStorage directly since we don't have getState here
    const token = localStorage.getItem("authToken");

    const { data } = await axios.get(
      `${baseUrl}/order/product-type-data/${productTypeId}`,
      {
        headers: getHeaders(token),
      }
    );

    return data;
  } catch (error: any) {
    console.error("Failed to fetch product type data:", error);
    throw error;
  }
};

/**
 * Get data for specific material type (when user selects a material type)
 */
export const getMaterialTypeData = (materialTypeId: string) => async () => {
  try {
    // Get token from localStorage directly since we don't have getState here
    const token = localStorage.getItem("authToken");

    const { data } = await axios.get(
      `${baseUrl}/order/material-type-data/${materialTypeId}`,
      {
        headers: getHeaders(token),
      }
    );

    return data;
  } catch (error: any) {
    console.error("Failed to fetch material type data:", error);
    throw error;
  }
};

/**
 * Clear order form data from Redux and localStorage
 * Use this on logout
 */
export const clearOrderFormData = () => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_ORDER_FORM_DATA });
};

/**
 * Force refresh order form data
 * Clears cache and forces a new API call
 */
export const refreshOrderFormData = () => async (
  dispatch: Dispatch<any>,
  getState: () => RootState
) => {
  dispatch({ type: REFRESH_ORDER_FORM_DATA });
  // After clearing, fetch fresh data
  const thunk = getOrderFormData();
  return thunk(dispatch, getState);
};

/**
 * 🚀 Smart helper: Only fetches if cache is missing or expired
 * Use this instead of getOrderFormData() in login/branch actions
 */
export const getOrderFormDataIfNeeded = () => async (
  dispatch: Dispatch<any>,
  getState: () => RootState
) => {
  const state = getState();
  const orderFormData = state.orderFormData;

  // Check if we already have valid data
  if (orderFormData?.data && orderFormData?.lastFetched) {
    const lastFetchedTime = new Date(orderFormData.lastFetched).getTime();
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // If cache is still valid, don't fetch
    if (now - lastFetchedTime < CACHE_DURATION) {
      console.log('✅ Using cached order form data (age:', Math.floor((now - lastFetchedTime) / 1000 / 60), 'minutes)');
      return orderFormData.data;
    } else {
      console.log('⚠️ Cache expired, fetching fresh data...');
    }
  } else {
    console.log('📊 No cache found, fetching order form data...');
  }

  // Fetch fresh data
  const thunk = getOrderFormData();
  return thunk(dispatch, getState);
};