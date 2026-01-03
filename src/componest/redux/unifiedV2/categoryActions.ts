/**
 * Unified Category Actions (v2 API)
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
export const CATEGORY_V2_CREATE_REQUEST = 'CATEGORY_V2_CREATE_REQUEST';
export const CATEGORY_V2_CREATE_SUCCESS = 'CATEGORY_V2_CREATE_SUCCESS';
export const CATEGORY_V2_CREATE_FAILURE = 'CATEGORY_V2_CREATE_FAILURE';

export const CATEGORY_V2_LIST_REQUEST = 'CATEGORY_V2_LIST_REQUEST';
export const CATEGORY_V2_LIST_SUCCESS = 'CATEGORY_V2_LIST_SUCCESS';
export const CATEGORY_V2_LIST_FAILURE = 'CATEGORY_V2_LIST_FAILURE';

export const CATEGORY_V2_GET_REQUEST = 'CATEGORY_V2_GET_REQUEST';
export const CATEGORY_V2_GET_SUCCESS = 'CATEGORY_V2_GET_SUCCESS';
export const CATEGORY_V2_GET_FAILURE = 'CATEGORY_V2_GET_FAILURE';

export const CATEGORY_V2_UPDATE_REQUEST = 'CATEGORY_V2_UPDATE_REQUEST';
export const CATEGORY_V2_UPDATE_SUCCESS = 'CATEGORY_V2_UPDATE_SUCCESS';
export const CATEGORY_V2_UPDATE_FAILURE = 'CATEGORY_V2_UPDATE_FAILURE';

export const CATEGORY_V2_DELETE_REQUEST = 'CATEGORY_V2_DELETE_REQUEST';
export const CATEGORY_V2_DELETE_SUCCESS = 'CATEGORY_V2_DELETE_SUCCESS';
export const CATEGORY_V2_DELETE_FAILURE = 'CATEGORY_V2_DELETE_FAILURE';

// Create Category
export const createCategoryV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CATEGORY_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/category`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: CATEGORY_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CATEGORY_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Categories
export const getCategoriesV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: CATEGORY_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/category${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    // Backend returns { data: { data: [...], count: X, user: {...} } }
    // Extract the actual array from response.data.data.data
    const result = response.data.data?.data || response.data.data || [];

    dispatch({
      type: CATEGORY_V2_LIST_SUCCESS,
      payload: result,
    });

    return result;
  } catch (error: any) {
    dispatch({
      type: CATEGORY_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Category
export const getCategoryV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: CATEGORY_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/category/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: CATEGORY_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CATEGORY_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Category
export const updateCategoryV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CATEGORY_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/category/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: CATEGORY_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CATEGORY_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Category
export const deleteCategoryV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: CATEGORY_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/category/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: CATEGORY_V2_DELETE_SUCCESS,
      payload: id,
    });

    dispatch(refreshOrderFormData() as any);
    return id;
  } catch (error: any) {
    dispatch({
      type: CATEGORY_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
