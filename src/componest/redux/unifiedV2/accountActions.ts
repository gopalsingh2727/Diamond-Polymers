/**
 * Unified Account Actions (v2 API)
 * Single handler: Create, Read, Update, Delete
 */

import axios from 'axios';
import { Dispatch } from 'redux';
import { refreshOrderFormData } from '../oders/orderFormDataActions';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  const selectedBranch = localStorage.getItem('selectedBranch');
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
export const ACCOUNT_V2_CREATE_REQUEST = 'ACCOUNT_V2_CREATE_REQUEST';
export const ACCOUNT_V2_CREATE_SUCCESS = 'ACCOUNT_V2_CREATE_SUCCESS';
export const ACCOUNT_V2_CREATE_FAILURE = 'ACCOUNT_V2_CREATE_FAILURE';

export const ACCOUNT_V2_LIST_REQUEST = 'ACCOUNT_V2_LIST_REQUEST';
export const ACCOUNT_V2_LIST_SUCCESS = 'ACCOUNT_V2_LIST_SUCCESS';
export const ACCOUNT_V2_LIST_FAILURE = 'ACCOUNT_V2_LIST_FAILURE';

export const ACCOUNT_V2_GET_REQUEST = 'ACCOUNT_V2_GET_REQUEST';
export const ACCOUNT_V2_GET_SUCCESS = 'ACCOUNT_V2_GET_SUCCESS';
export const ACCOUNT_V2_GET_FAILURE = 'ACCOUNT_V2_GET_FAILURE';

export const ACCOUNT_V2_UPDATE_REQUEST = 'ACCOUNT_V2_UPDATE_REQUEST';
export const ACCOUNT_V2_UPDATE_SUCCESS = 'ACCOUNT_V2_UPDATE_SUCCESS';
export const ACCOUNT_V2_UPDATE_FAILURE = 'ACCOUNT_V2_UPDATE_FAILURE';

export const ACCOUNT_V2_DELETE_REQUEST = 'ACCOUNT_V2_DELETE_REQUEST';
export const ACCOUNT_V2_DELETE_SUCCESS = 'ACCOUNT_V2_DELETE_SUCCESS';
export const ACCOUNT_V2_DELETE_FAILURE = 'ACCOUNT_V2_DELETE_FAILURE';

// Create Account
export const createAccountV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: ACCOUNT_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/account`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: ACCOUNT_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: ACCOUNT_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Accounts
export const getAccountsV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: ACCOUNT_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/account${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: ACCOUNT_V2_LIST_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: ACCOUNT_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Account
export const getAccountV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: ACCOUNT_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/account/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: ACCOUNT_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: ACCOUNT_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Account
export const updateAccountV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: ACCOUNT_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/account/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: ACCOUNT_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: ACCOUNT_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Account
export const deleteAccountV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: ACCOUNT_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/account/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: ACCOUNT_V2_DELETE_SUCCESS,
      payload: id,
    });

    dispatch(refreshOrderFormData() as any);
    return id;
  } catch (error: any) {
    dispatch({
      type: ACCOUNT_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
