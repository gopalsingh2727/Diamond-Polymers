import axios from "axios";
import {
  GET_MACHINE_ORDERS_REQUEST,
  GET_MACHINE_ORDERS_SUCCESS,
  GET_MACHINE_ORDERS_FAIL,
  GET_ORDER_TABLE_DATA_REQUEST,
  GET_ORDER_TABLE_DATA_SUCCESS,
  GET_ORDER_TABLE_DATA_FAIL,
  ADD_TABLE_ROW_REQUEST,
  ADD_TABLE_ROW_SUCCESS,
  ADD_TABLE_ROW_FAIL,
  UPDATE_TABLE_ROW_REQUEST,
  UPDATE_TABLE_ROW_SUCCESS,
  UPDATE_TABLE_ROW_FAIL,
  DELETE_TABLE_ROW_REQUEST,
  DELETE_TABLE_ROW_SUCCESS,
  DELETE_TABLE_ROW_FAIL,
  MARK_ORDER_COMPLETE_REQUEST,
  MARK_ORDER_COMPLETE_SUCCESS,
  MARK_ORDER_COMPLETE_FAIL,
  CLEAR_OPERATOR_VIEW_ERROR,
  CLEAR_ORDER_TABLE_DATA,
  SET_SELECTED_ORDER
} from "./operatorViewConstants";
import { Dispatch } from "redux";
import { RootState } from "../rootReducer";

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

// Types
export interface RowValue {
  columnName: string;
  value: any;
  unit?: string;
}

export interface TableRow {
  _id?: string;
  rowNumber?: number;
  values: RowValue[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Get Orders for Machine
export const getMachineOrders = (machineId: string, options?: { status?: string; orderTypeId?: string }) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_MACHINE_ORDERS_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    let url = `${baseUrl}/machine/${machineId}/orders?branchId=${branchId}`;
    if (options?.status) url += `&status=${options.status}`;
    if (options?.orderTypeId) url += `&orderTypeId=${options.orderTypeId}`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_MACHINE_ORDERS_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch machine orders";
    dispatch({ type: GET_MACHINE_ORDERS_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Order Table Data
export const getOrderTableData = (machineId: string, orderId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_ORDER_TABLE_DATA_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/machine/${machineId}/orders/${orderId}/table`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_ORDER_TABLE_DATA_SUCCESS, payload: { orderId, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch order table data";
    dispatch({ type: GET_ORDER_TABLE_DATA_FAIL, payload: errorMessage });
    throw error;
  }
};

// Add Table Row
export const addTableRow = (machineId: string, orderId: string, rowData: { values: RowValue[] }) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: ADD_TABLE_ROW_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/machine/${machineId}/orders/${orderId}/table/row`,
      rowData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: ADD_TABLE_ROW_SUCCESS, payload: { orderId, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to add table row";
    dispatch({ type: ADD_TABLE_ROW_FAIL, payload: errorMessage });
    throw error;
  }
};

// Update Table Row
export const updateTableRow = (machineId: string, orderId: string, rowId: string, rowData: { values: RowValue[] }) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_TABLE_ROW_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/machine/${machineId}/orders/${orderId}/table/row/${rowId}`,
      rowData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_TABLE_ROW_SUCCESS, payload: { orderId, rowId, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update table row";
    dispatch({ type: UPDATE_TABLE_ROW_FAIL, payload: errorMessage });
    throw error;
  }
};

// Delete Table Row
export const deleteTableRow = (machineId: string, orderId: string, rowId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_TABLE_ROW_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(
      `${baseUrl}/machine/${machineId}/orders/${orderId}/table/row/${rowId}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: DELETE_TABLE_ROW_SUCCESS, payload: { orderId, rowId, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete table row";
    dispatch({ type: DELETE_TABLE_ROW_FAIL, payload: errorMessage });
    throw error;
  }
};

// Mark Order Complete
export const markOrderComplete = (machineId: string, orderId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: MARK_ORDER_COMPLETE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/machine/${machineId}/orders/${orderId}/complete`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: MARK_ORDER_COMPLETE_SUCCESS, payload: { orderId, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to mark order complete";
    dispatch({ type: MARK_ORDER_COMPLETE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Clear Error
export const clearOperatorViewError = () => ({
  type: CLEAR_OPERATOR_VIEW_ERROR
});

// Clear Order Table Data
export const clearOrderTableData = () => ({
  type: CLEAR_ORDER_TABLE_DATA
});

// Set Selected Order
export const setSelectedOrder = (order: any) => ({
  type: SET_SELECTED_ORDER,
  payload: order
});
