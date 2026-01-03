/**
 * Unified Customer Category Actions (v2 API)
 * Single handler: Create, Read, Update, Delete
 */

import axios from 'axios';
import { Dispatch } from 'redux';
import { refreshOrderFormData } from '../oders/orderFormDataActions';

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
export const CUSTOMER_CATEGORY_V2_CREATE_REQUEST = 'CUSTOMER_CATEGORY_V2_CREATE_REQUEST';
export const CUSTOMER_CATEGORY_V2_CREATE_SUCCESS = 'CUSTOMER_CATEGORY_V2_CREATE_SUCCESS';
export const CUSTOMER_CATEGORY_V2_CREATE_FAILURE = 'CUSTOMER_CATEGORY_V2_CREATE_FAILURE';

export const CUSTOMER_CATEGORY_V2_LIST_REQUEST = 'CUSTOMER_CATEGORY_V2_LIST_REQUEST';
export const CUSTOMER_CATEGORY_V2_LIST_SUCCESS = 'CUSTOMER_CATEGORY_V2_LIST_SUCCESS';
export const CUSTOMER_CATEGORY_V2_LIST_FAILURE = 'CUSTOMER_CATEGORY_V2_LIST_FAILURE';

export const CUSTOMER_CATEGORY_V2_GET_REQUEST = 'CUSTOMER_CATEGORY_V2_GET_REQUEST';
export const CUSTOMER_CATEGORY_V2_GET_SUCCESS = 'CUSTOMER_CATEGORY_V2_GET_SUCCESS';
export const CUSTOMER_CATEGORY_V2_GET_FAILURE = 'CUSTOMER_CATEGORY_V2_GET_FAILURE';

export const CUSTOMER_CATEGORY_V2_UPDATE_REQUEST = 'CUSTOMER_CATEGORY_V2_UPDATE_REQUEST';
export const CUSTOMER_CATEGORY_V2_UPDATE_SUCCESS = 'CUSTOMER_CATEGORY_V2_UPDATE_SUCCESS';
export const CUSTOMER_CATEGORY_V2_UPDATE_FAILURE = 'CUSTOMER_CATEGORY_V2_UPDATE_FAILURE';

export const CUSTOMER_CATEGORY_V2_DELETE_REQUEST = 'CUSTOMER_CATEGORY_V2_DELETE_REQUEST';
export const CUSTOMER_CATEGORY_V2_DELETE_SUCCESS = 'CUSTOMER_CATEGORY_V2_DELETE_SUCCESS';
export const CUSTOMER_CATEGORY_V2_DELETE_FAILURE = 'CUSTOMER_CATEGORY_V2_DELETE_FAILURE';

// Create Customer Category
export const createCustomerCategoryV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/customer-category`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: CUSTOMER_CATEGORY_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CUSTOMER_CATEGORY_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Customer Categories
export const getCustomerCategoriesV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/customer-category${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: CUSTOMER_CATEGORY_V2_LIST_SUCCESS,
      payload: response.data.data.data || response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CUSTOMER_CATEGORY_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Customer Category
export const getCustomerCategoryV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/customer-category/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: CUSTOMER_CATEGORY_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CUSTOMER_CATEGORY_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Customer Category
export const updateCustomerCategoryV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/customer-category/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: CUSTOMER_CATEGORY_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CUSTOMER_CATEGORY_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Customer Category
export const deleteCustomerCategoryV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: CUSTOMER_CATEGORY_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/customer-category/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: CUSTOMER_CATEGORY_V2_DELETE_SUCCESS,
      payload: id,
    });

    dispatch(refreshOrderFormData() as any);
    return id;
  } catch (error: any) {
    dispatch({
      type: CUSTOMER_CATEGORY_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
