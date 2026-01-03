/**
 * Inventory Transaction Actions (v2 API)
 * Read-only transaction history
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

// Action Types
export const INVENTORY_TRANSACTION_V2_LIST_REQUEST = 'INVENTORY_TRANSACTION_V2_LIST_REQUEST';
export const INVENTORY_TRANSACTION_V2_LIST_SUCCESS = 'INVENTORY_TRANSACTION_V2_LIST_SUCCESS';
export const INVENTORY_TRANSACTION_V2_LIST_FAILURE = 'INVENTORY_TRANSACTION_V2_LIST_FAILURE';

export const INVENTORY_TRANSACTION_V2_GET_REQUEST = 'INVENTORY_TRANSACTION_V2_GET_REQUEST';
export const INVENTORY_TRANSACTION_V2_GET_SUCCESS = 'INVENTORY_TRANSACTION_V2_GET_SUCCESS';
export const INVENTORY_TRANSACTION_V2_GET_FAILURE = 'INVENTORY_TRANSACTION_V2_GET_FAILURE';

export const INVENTORY_TRANSACTION_V2_CREATE_REQUEST = 'INVENTORY_TRANSACTION_V2_CREATE_REQUEST';
export const INVENTORY_TRANSACTION_V2_CREATE_SUCCESS = 'INVENTORY_TRANSACTION_V2_CREATE_SUCCESS';
export const INVENTORY_TRANSACTION_V2_CREATE_FAILURE = 'INVENTORY_TRANSACTION_V2_CREATE_FAILURE';

export const INVENTORY_TRANSACTION_V2_DELETE_REQUEST = 'INVENTORY_TRANSACTION_V2_DELETE_REQUEST';
export const INVENTORY_TRANSACTION_V2_DELETE_SUCCESS = 'INVENTORY_TRANSACTION_V2_DELETE_SUCCESS';
export const INVENTORY_TRANSACTION_V2_DELETE_FAILURE = 'INVENTORY_TRANSACTION_V2_DELETE_FAILURE';

// Transaction Data Interface
export interface CreateTransactionData {
  inventoryId: string;
  optionId?: string;
  type: 'credit' | 'debit' | 'adjustment';
  quantity: number;
  reason: string;
  createdBy: string;
  createdByName: string;
  referenceType?: string;
  referenceId?: string;
}

// Create Transaction (Credit/Debit)
export const createInventoryTransactionV2 = (data: CreateTransactionData) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TRANSACTION_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/inventory-transaction`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_TRANSACTION_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TRANSACTION_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Transactions
export const getInventoryTransactionsV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TRANSACTION_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/inventory-transaction${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_TRANSACTION_V2_LIST_SUCCESS,
      payload: response.data.data.data || response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TRANSACTION_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Transaction
export const getInventoryTransactionV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TRANSACTION_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/inventory-transaction/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_TRANSACTION_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TRANSACTION_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Transaction
export const deleteInventoryTransactionV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TRANSACTION_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/inventory-transaction/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_TRANSACTION_V2_DELETE_SUCCESS,
      payload: id,
    });

    return id;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TRANSACTION_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
