/**
 * Unified Device Access Actions (v2 API)
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
export const DEVICE_ACCESS_V2_CREATE_REQUEST = 'DEVICE_ACCESS_V2_CREATE_REQUEST';
export const DEVICE_ACCESS_V2_CREATE_SUCCESS = 'DEVICE_ACCESS_V2_CREATE_SUCCESS';
export const DEVICE_ACCESS_V2_CREATE_FAILURE = 'DEVICE_ACCESS_V2_CREATE_FAILURE';

export const DEVICE_ACCESS_V2_LIST_REQUEST = 'DEVICE_ACCESS_V2_LIST_REQUEST';
export const DEVICE_ACCESS_V2_LIST_SUCCESS = 'DEVICE_ACCESS_V2_LIST_SUCCESS';
export const DEVICE_ACCESS_V2_LIST_FAILURE = 'DEVICE_ACCESS_V2_LIST_FAILURE';

export const DEVICE_ACCESS_V2_GET_REQUEST = 'DEVICE_ACCESS_V2_GET_REQUEST';
export const DEVICE_ACCESS_V2_GET_SUCCESS = 'DEVICE_ACCESS_V2_GET_SUCCESS';
export const DEVICE_ACCESS_V2_GET_FAILURE = 'DEVICE_ACCESS_V2_GET_FAILURE';

export const DEVICE_ACCESS_V2_UPDATE_REQUEST = 'DEVICE_ACCESS_V2_UPDATE_REQUEST';
export const DEVICE_ACCESS_V2_UPDATE_SUCCESS = 'DEVICE_ACCESS_V2_UPDATE_SUCCESS';
export const DEVICE_ACCESS_V2_UPDATE_FAILURE = 'DEVICE_ACCESS_V2_UPDATE_FAILURE';

export const DEVICE_ACCESS_V2_DELETE_REQUEST = 'DEVICE_ACCESS_V2_DELETE_REQUEST';
export const DEVICE_ACCESS_V2_DELETE_SUCCESS = 'DEVICE_ACCESS_V2_DELETE_SUCCESS';
export const DEVICE_ACCESS_V2_DELETE_FAILURE = 'DEVICE_ACCESS_V2_DELETE_FAILURE';

// Create Device Access
export const createDeviceAccessV2 = (data: {
  deviceName: string;
  location?: string;
  password: string;
}) => async (dispatch: Dispatch) => {
  dispatch({ type: DEVICE_ACCESS_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/device-access`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: DEVICE_ACCESS_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: DEVICE_ACCESS_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Device Access
export const getDeviceAccessListV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: DEVICE_ACCESS_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/device-access${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    // Backend returns { data: { data: [...], count: X, user: {...} } }
    // Extract the actual array from response.data.data.data
    const devices = response.data.data?.data || response.data.data || [];

    dispatch({
      type: DEVICE_ACCESS_V2_LIST_SUCCESS,
      payload: devices,
    });

    return devices;
  } catch (error: any) {
    dispatch({
      type: DEVICE_ACCESS_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Device Access
export const getDeviceAccessV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DEVICE_ACCESS_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/device-access/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: DEVICE_ACCESS_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: DEVICE_ACCESS_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Device Access
export const updateDeviceAccessV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: DEVICE_ACCESS_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/device-access/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: DEVICE_ACCESS_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    dispatch(refreshOrderFormData() as any);
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: DEVICE_ACCESS_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Device Access
export const deleteDeviceAccessV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DEVICE_ACCESS_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/device-access/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: DEVICE_ACCESS_V2_DELETE_SUCCESS,
      payload: id,
    });

    dispatch(refreshOrderFormData() as any);
    return id;
  } catch (error: any) {
    dispatch({
      type: DEVICE_ACCESS_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Reset Device Access State
export const DEVICE_ACCESS_V2_RESET = 'DEVICE_ACCESS_V2_RESET';
export const resetDeviceAccessStateV2 = () => ({
  type: DEVICE_ACCESS_V2_RESET
});
