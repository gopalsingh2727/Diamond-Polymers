/**
 * Unified Excel Type Actions (v2 API)
 * Single handler: Create, Read, Update, Delete
 * Supports Account and Manufacturing categories
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
export const EXCEL_TYPE_V2_CREATE_REQUEST = 'EXCEL_TYPE_V2_CREATE_REQUEST';
export const EXCEL_TYPE_V2_CREATE_SUCCESS = 'EXCEL_TYPE_V2_CREATE_SUCCESS';
export const EXCEL_TYPE_V2_CREATE_FAILURE = 'EXCEL_TYPE_V2_CREATE_FAILURE';

export const EXCEL_TYPE_V2_LIST_REQUEST = 'EXCEL_TYPE_V2_LIST_REQUEST';
export const EXCEL_TYPE_V2_LIST_SUCCESS = 'EXCEL_TYPE_V2_LIST_SUCCESS';
export const EXCEL_TYPE_V2_LIST_FAILURE = 'EXCEL_TYPE_V2_LIST_FAILURE';

export const EXCEL_TYPE_V2_GET_REQUEST = 'EXCEL_TYPE_V2_GET_REQUEST';
export const EXCEL_TYPE_V2_GET_SUCCESS = 'EXCEL_TYPE_V2_GET_SUCCESS';
export const EXCEL_TYPE_V2_GET_FAILURE = 'EXCEL_TYPE_V2_GET_FAILURE';

export const EXCEL_TYPE_V2_UPDATE_REQUEST = 'EXCEL_TYPE_V2_UPDATE_REQUEST';
export const EXCEL_TYPE_V2_UPDATE_SUCCESS = 'EXCEL_TYPE_V2_UPDATE_SUCCESS';
export const EXCEL_TYPE_V2_UPDATE_FAILURE = 'EXCEL_TYPE_V2_UPDATE_FAILURE';

export const EXCEL_TYPE_V2_DELETE_REQUEST = 'EXCEL_TYPE_V2_DELETE_REQUEST';
export const EXCEL_TYPE_V2_DELETE_SUCCESS = 'EXCEL_TYPE_V2_DELETE_SUCCESS';
export const EXCEL_TYPE_V2_DELETE_FAILURE = 'EXCEL_TYPE_V2_DELETE_FAILURE';

// Create Excel Type
export const createExcelTypeV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/excel-type`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: EXCEL_TYPE_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Excel Types
export const getExcelTypesV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/excel-type${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    // Backend returns { data: { data: [...], count: X, user: {...} } }
    const result = response.data.data?.data || response.data.data || [];

    dispatch({
      type: EXCEL_TYPE_V2_LIST_SUCCESS,
      payload: result,
    });

    return result;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Excel Types By Category (Account or Manufacturing)
export const getExcelTypesByCategoryV2 = (category: 'account' | 'manufacturing') => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_LIST_REQUEST });

  try {
    const url = `${baseUrl}/v2/excel-type?category=${category}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    const result = response.data.data?.data || response.data.data || [];

    dispatch({
      type: EXCEL_TYPE_V2_LIST_SUCCESS,
      payload: result,
    });

    return result;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Excel Types By Sub-Category
export const getExcelTypesBySubCategoryV2 = (category: string, subCategory: string) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_LIST_REQUEST });

  try {
    const url = `${baseUrl}/v2/excel-type?category=${category}&subCategory=${subCategory}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    const result = response.data.data?.data || response.data.data || [];

    dispatch({
      type: EXCEL_TYPE_V2_LIST_SUCCESS,
      payload: result,
    });

    return result;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Excel Type
export const getExcelTypeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/excel-type/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: EXCEL_TYPE_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Excel Type
export const updateExcelTypeV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/excel-type/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: EXCEL_TYPE_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Excel Type
export const deleteExcelTypeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/excel-type/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: EXCEL_TYPE_V2_DELETE_SUCCESS,
      payload: id,
    });

    dispatch(refreshOrderFormData() as any);
    return id;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Excel Types By Order Type
export const getExcelTypesByOrderTypeV2 = (orderTypeId: string) => async (dispatch: Dispatch) => {
  dispatch({ type: EXCEL_TYPE_V2_LIST_REQUEST });

  try {
    const url = `${baseUrl}/v2/excel-type?orderTypeId=${orderTypeId}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    const result = response.data.data?.data || response.data.data || [];

    dispatch({
      type: EXCEL_TYPE_V2_LIST_SUCCESS,
      payload: result,
    });

    return result;
  } catch (error: any) {
    dispatch({
      type: EXCEL_TYPE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
