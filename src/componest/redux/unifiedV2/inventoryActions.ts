/**
 * Unified Inventory Actions (v2 API)
 * CRUD + Operations (credit, debit, transfer, reserve, release)
 */

import axios from 'axios';
import { Dispatch } from 'redux';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getHeaders = (branchId?: string) => {
  const token = localStorage.getItem('authToken');
  const selectedBranch = branchId || localStorage.getItem('selectedBranch');
  const headers: Record<string, string> = {
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (selectedBranch) {
    headers['x-selected-branch'] = selectedBranch;
  }
  return headers;
};

// ============== CRUD Action Types ==============
export const INVENTORY_V2_CREATE_REQUEST = 'INVENTORY_V2_CREATE_REQUEST';
export const INVENTORY_V2_CREATE_SUCCESS = 'INVENTORY_V2_CREATE_SUCCESS';
export const INVENTORY_V2_CREATE_FAILURE = 'INVENTORY_V2_CREATE_FAILURE';

export const INVENTORY_V2_LIST_REQUEST = 'INVENTORY_V2_LIST_REQUEST';
export const INVENTORY_V2_LIST_SUCCESS = 'INVENTORY_V2_LIST_SUCCESS';
export const INVENTORY_V2_LIST_FAILURE = 'INVENTORY_V2_LIST_FAILURE';

export const INVENTORY_V2_GET_REQUEST = 'INVENTORY_V2_GET_REQUEST';
export const INVENTORY_V2_GET_SUCCESS = 'INVENTORY_V2_GET_SUCCESS';
export const INVENTORY_V2_GET_FAILURE = 'INVENTORY_V2_GET_FAILURE';

export const INVENTORY_V2_UPDATE_REQUEST = 'INVENTORY_V2_UPDATE_REQUEST';
export const INVENTORY_V2_UPDATE_SUCCESS = 'INVENTORY_V2_UPDATE_SUCCESS';
export const INVENTORY_V2_UPDATE_FAILURE = 'INVENTORY_V2_UPDATE_FAILURE';

export const INVENTORY_V2_DELETE_REQUEST = 'INVENTORY_V2_DELETE_REQUEST';
export const INVENTORY_V2_DELETE_SUCCESS = 'INVENTORY_V2_DELETE_SUCCESS';
export const INVENTORY_V2_DELETE_FAILURE = 'INVENTORY_V2_DELETE_FAILURE';

// ============== Operation Action Types ==============
export const INVENTORY_CREDIT_REQUEST = 'INVENTORY_CREDIT_REQUEST';
export const INVENTORY_CREDIT_SUCCESS = 'INVENTORY_CREDIT_SUCCESS';
export const INVENTORY_CREDIT_FAILURE = 'INVENTORY_CREDIT_FAILURE';

export const INVENTORY_DEBIT_REQUEST = 'INVENTORY_DEBIT_REQUEST';
export const INVENTORY_DEBIT_SUCCESS = 'INVENTORY_DEBIT_SUCCESS';
export const INVENTORY_DEBIT_FAILURE = 'INVENTORY_DEBIT_FAILURE';

export const INVENTORY_TRANSFER_REQUEST = 'INVENTORY_TRANSFER_REQUEST';
export const INVENTORY_TRANSFER_SUCCESS = 'INVENTORY_TRANSFER_SUCCESS';
export const INVENTORY_TRANSFER_FAILURE = 'INVENTORY_TRANSFER_FAILURE';

export const INVENTORY_ALERTS_REQUEST = 'INVENTORY_ALERTS_REQUEST';
export const INVENTORY_ALERTS_SUCCESS = 'INVENTORY_ALERTS_SUCCESS';
export const INVENTORY_ALERTS_FAILURE = 'INVENTORY_ALERTS_FAILURE';

export const INVENTORY_SUMMARY_REQUEST = 'INVENTORY_SUMMARY_REQUEST';
export const INVENTORY_SUMMARY_SUCCESS = 'INVENTORY_SUMMARY_SUCCESS';
export const INVENTORY_SUMMARY_FAILURE = 'INVENTORY_SUMMARY_FAILURE';

// ============== CRUD Actions ==============

// Create Inventory
export const createInventoryV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/inventory`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Inventory
export const getInventoryV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/inventory${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_V2_LIST_SUCCESS,
      payload: response.data.data.data || response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Inventory
export const getInventoryItemV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/inventory/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Inventory
export const updateInventoryV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/inventory/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Inventory
export const deleteInventoryV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/inventory/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_V2_DELETE_SUCCESS,
      payload: id,
    });

    return id;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ============== Operation Actions ==============

interface CreditDebitData {
  quantity: number;
  reason: string;
  referenceType?: 'manual' | 'adjustment' | 'purchase' | 'return' | 'order';
  referenceId?: string;
  notes?: string;
}

interface TransferData {
  fromInventoryId: string;
  toInventoryId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

// Credit Inventory (Add Stock)
export const creditInventory = (id: string, data: CreditDebitData) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_CREDIT_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/inventory/${id}/credit`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_CREDIT_SUCCESS,
      payload: response.data.data,
    });

    // Refresh inventory list
    dispatch(getInventoryV2() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_CREDIT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Debit Inventory (Remove Stock)
export const debitInventory = (id: string, data: CreditDebitData) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_DEBIT_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/inventory/${id}/debit`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_DEBIT_SUCCESS,
      payload: response.data.data,
    });

    // Refresh inventory list
    dispatch(getInventoryV2() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_DEBIT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Transfer Inventory Between Locations
export const transferInventory = (data: TransferData) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TRANSFER_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/inventory/transfer`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_TRANSFER_SUCCESS,
      payload: response.data.data,
    });

    // Refresh inventory list
    dispatch(getInventoryV2() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TRANSFER_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Low Stock Alerts
export const getInventoryAlerts = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_ALERTS_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/inventory/alerts${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_ALERTS_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_ALERTS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Inventory Summary
export const getInventorySummary = () => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_SUMMARY_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/inventory/alerts/summary`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_SUMMARY_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_SUMMARY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
