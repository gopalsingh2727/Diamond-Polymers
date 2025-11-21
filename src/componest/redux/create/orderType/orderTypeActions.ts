import axios from "axios";
import {
  CREATE_ORDER_TYPE_REQUEST,
  CREATE_ORDER_TYPE_SUCCESS,
  CREATE_ORDER_TYPE_FAIL,
  GET_ORDER_TYPES_REQUEST,
  GET_ORDER_TYPES_SUCCESS,
  GET_ORDER_TYPES_FAIL,
  GET_ORDER_TYPE_BY_ID_REQUEST,
  GET_ORDER_TYPE_BY_ID_SUCCESS,
  GET_ORDER_TYPE_BY_ID_FAIL,
  GET_ORDER_TYPES_BY_BRANCH_REQUEST,
  GET_ORDER_TYPES_BY_BRANCH_SUCCESS,
  GET_ORDER_TYPES_BY_BRANCH_FAIL,
  GET_DEFAULT_ORDER_TYPE_REQUEST,
  GET_DEFAULT_ORDER_TYPE_SUCCESS,
  GET_DEFAULT_ORDER_TYPE_FAIL,
  UPDATE_ORDER_TYPE_REQUEST,
  UPDATE_ORDER_TYPE_SUCCESS,
  UPDATE_ORDER_TYPE_FAIL,
  DELETE_ORDER_TYPE_REQUEST,
  DELETE_ORDER_TYPE_SUCCESS,
  DELETE_ORDER_TYPE_FAIL
} from "./orderTypeConstants";
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
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(extra || {}),
});

// Create Order Type
export const createOrderType = (orderTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_ORDER_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    // Add branchId to the order type data if available
    const dataToSend = {
      ...orderTypeData,
      branchId: orderTypeData.branchId || branchId
    };

    const { data } = await axios.post(
      `${baseUrl}/ordertype`,
      dataToSend,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_ORDER_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create order type";
    dispatch({ type: CREATE_ORDER_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get All Order Types
export const getOrderTypes = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_ORDER_TYPES_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/ordertype?branchId=${branchId}`
      : `${baseUrl}/ordertype`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_ORDER_TYPES_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch order types";
    dispatch({ type: GET_ORDER_TYPES_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Order Type by ID
export const getOrderTypeById = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_ORDER_TYPE_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/ordertype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_ORDER_TYPE_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch order type";
    dispatch({ type: GET_ORDER_TYPE_BY_ID_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Order Types by Branch
export const getOrderTypesByBranch = (branchId: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_ORDER_TYPES_BY_BRANCH_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/ordertype/branch/${branchId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_ORDER_TYPES_BY_BRANCH_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch order types by branch";
    dispatch({ type: GET_ORDER_TYPES_BY_BRANCH_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Default Order Type
export const getDefaultOrderType = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_DEFAULT_ORDER_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/ordertype/default?branchId=${branchId}`
      : `${baseUrl}/ordertype/default`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_DEFAULT_ORDER_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch default order type";
    dispatch({ type: GET_DEFAULT_ORDER_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Update Order Type
export const updateOrderType = (id: string, orderTypeData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_ORDER_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/ordertype/${id}`,
      orderTypeData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_ORDER_TYPE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update order type";
    dispatch({ type: UPDATE_ORDER_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Delete Order Type
export const deleteOrderType = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_ORDER_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(
      `${baseUrl}/ordertype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: DELETE_ORDER_TYPE_SUCCESS, payload: { id, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete order type";
    dispatch({ type: DELETE_ORDER_TYPE_FAIL, payload: errorMessage });
    throw error;
  }
};
