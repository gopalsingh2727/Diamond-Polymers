/**
 * Unified Parent Company Actions (v2 API)
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
export const PARENT_COMPANY_V2_CREATE_REQUEST = 'PARENT_COMPANY_V2_CREATE_REQUEST';
export const PARENT_COMPANY_V2_CREATE_SUCCESS = 'PARENT_COMPANY_V2_CREATE_SUCCESS';
export const PARENT_COMPANY_V2_CREATE_FAILURE = 'PARENT_COMPANY_V2_CREATE_FAILURE';

export const PARENT_COMPANY_V2_LIST_REQUEST = 'PARENT_COMPANY_V2_LIST_REQUEST';
export const PARENT_COMPANY_V2_LIST_SUCCESS = 'PARENT_COMPANY_V2_LIST_SUCCESS';
export const PARENT_COMPANY_V2_LIST_FAILURE = 'PARENT_COMPANY_V2_LIST_FAILURE';

export const PARENT_COMPANY_V2_GET_REQUEST = 'PARENT_COMPANY_V2_GET_REQUEST';
export const PARENT_COMPANY_V2_GET_SUCCESS = 'PARENT_COMPANY_V2_GET_SUCCESS';
export const PARENT_COMPANY_V2_GET_FAILURE = 'PARENT_COMPANY_V2_GET_FAILURE';

export const PARENT_COMPANY_V2_UPDATE_REQUEST = 'PARENT_COMPANY_V2_UPDATE_REQUEST';
export const PARENT_COMPANY_V2_UPDATE_SUCCESS = 'PARENT_COMPANY_V2_UPDATE_SUCCESS';
export const PARENT_COMPANY_V2_UPDATE_FAILURE = 'PARENT_COMPANY_V2_UPDATE_FAILURE';

export const PARENT_COMPANY_V2_DELETE_REQUEST = 'PARENT_COMPANY_V2_DELETE_REQUEST';
export const PARENT_COMPANY_V2_DELETE_SUCCESS = 'PARENT_COMPANY_V2_DELETE_SUCCESS';
export const PARENT_COMPANY_V2_DELETE_FAILURE = 'PARENT_COMPANY_V2_DELETE_FAILURE';

// Create Parent Company
export const createParentCompanyV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: PARENT_COMPANY_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/parent-company`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: PARENT_COMPANY_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: PARENT_COMPANY_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Parent Companies
export const getParentCompaniesV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: PARENT_COMPANY_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/parent-company${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: PARENT_COMPANY_V2_LIST_SUCCESS,
      payload: response.data.data.data || response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: PARENT_COMPANY_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Parent Company
export const getParentCompanyV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: PARENT_COMPANY_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/parent-company/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: PARENT_COMPANY_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: PARENT_COMPANY_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Parent Company
export const updateParentCompanyV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: PARENT_COMPANY_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/parent-company/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: PARENT_COMPANY_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: PARENT_COMPANY_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Parent Company
export const deleteParentCompanyV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: PARENT_COMPANY_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/parent-company/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: PARENT_COMPANY_V2_DELETE_SUCCESS,
      payload: id,
    });

    dispatch(refreshOrderFormData() as any);
    return id;
  } catch (error: any) {
    dispatch({
      type: PARENT_COMPANY_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
