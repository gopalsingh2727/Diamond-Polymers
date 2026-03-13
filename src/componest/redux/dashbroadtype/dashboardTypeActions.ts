/**
 * Unified Dashboard Type Actions  (v2 API)
 * Create · Read (list + single) · Update · Delete
 */

import axios from 'axios';
import { Dispatch } from 'redux';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getHeaders = (branchId?: string) => {
  const token          = localStorage.getItem('authToken');
  const selectedBranch = branchId || localStorage.getItem('selectedBranch');

  const headers: Record<string, string> = {
    'x-api-key':     API_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
  };
  if (selectedBranch) headers['x-selected-branch'] = selectedBranch;
  return headers;
};

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────
export const DASHBOARD_TYPE_V2_CREATE_REQUEST = 'DASHBOARD_TYPE_V2_CREATE_REQUEST';
export const DASHBOARD_TYPE_V2_CREATE_SUCCESS = 'DASHBOARD_TYPE_V2_CREATE_SUCCESS';
export const DASHBOARD_TYPE_V2_CREATE_FAILURE = 'DASHBOARD_TYPE_V2_CREATE_FAILURE';

export const DASHBOARD_TYPE_V2_LIST_REQUEST = 'DASHBOARD_TYPE_V2_LIST_REQUEST';
export const DASHBOARD_TYPE_V2_LIST_SUCCESS = 'DASHBOARD_TYPE_V2_LIST_SUCCESS';
export const DASHBOARD_TYPE_V2_LIST_FAILURE = 'DASHBOARD_TYPE_V2_LIST_FAILURE';

export const DASHBOARD_TYPE_V2_GET_REQUEST = 'DASHBOARD_TYPE_V2_GET_REQUEST';
export const DASHBOARD_TYPE_V2_GET_SUCCESS = 'DASHBOARD_TYPE_V2_GET_SUCCESS';
export const DASHBOARD_TYPE_V2_GET_FAILURE = 'DASHBOARD_TYPE_V2_GET_FAILURE';

export const DASHBOARD_TYPE_V2_UPDATE_REQUEST = 'DASHBOARD_TYPE_V2_UPDATE_REQUEST';
export const DASHBOARD_TYPE_V2_UPDATE_SUCCESS = 'DASHBOARD_TYPE_V2_UPDATE_SUCCESS';
export const DASHBOARD_TYPE_V2_UPDATE_FAILURE = 'DASHBOARD_TYPE_V2_UPDATE_FAILURE';

export const DASHBOARD_TYPE_V2_DELETE_REQUEST = 'DASHBOARD_TYPE_V2_DELETE_REQUEST';
export const DASHBOARD_TYPE_V2_DELETE_SUCCESS = 'DASHBOARD_TYPE_V2_DELETE_SUCCESS';
export const DASHBOARD_TYPE_V2_DELETE_FAILURE = 'DASHBOARD_TYPE_V2_DELETE_FAILURE';

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────
export const createDashboardTypeV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: DASHBOARD_TYPE_V2_CREATE_REQUEST });
  try {
    const response = await axios.post(`${baseUrl}/v2/dashboard-type`, data, {
      headers: getHeaders(),
    });
    dispatch({ type: DASHBOARD_TYPE_V2_CREATE_SUCCESS, payload: response.data.data });
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type:    DASHBOARD_TYPE_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardTypesV2 = (
  params?: Record<string, any>
) => async (dispatch: Dispatch) => {
  dispatch({ type: DASHBOARD_TYPE_V2_LIST_REQUEST });
  try {
    const qs  = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/dashboard-type${qs ? `?${qs}` : ''}`;

    const response = await axios.get(url, { headers: getHeaders() });

    // Backend wraps: { data: { data: [...], count: X } }
    const result = response.data.data?.data || response.data.data || [];

    dispatch({ type: DASHBOARD_TYPE_V2_LIST_SUCCESS, payload: result });
    return result;
  } catch (error: any) {
    dispatch({
      type:    DASHBOARD_TYPE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardTypeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DASHBOARD_TYPE_V2_GET_REQUEST });
  try {
    const response = await axios.get(`${baseUrl}/v2/dashboard-type/${id}`, {
      headers: getHeaders(),
    });
    dispatch({ type: DASHBOARD_TYPE_V2_GET_SUCCESS, payload: response.data.data });
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type:    DASHBOARD_TYPE_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────────────
export const updateDashboardTypeV2 = (
  id: string,
  data: any
) => async (dispatch: Dispatch) => {
  dispatch({ type: DASHBOARD_TYPE_V2_UPDATE_REQUEST });
  try {
    const response = await axios.put(`${baseUrl}/v2/dashboard-type/${id}`, data, {
      headers: getHeaders(),
    });
    dispatch({ type: DASHBOARD_TYPE_V2_UPDATE_SUCCESS, payload: response.data.data });
    return response.data.data;
  } catch (error: any) {
    dispatch({
      type:    DASHBOARD_TYPE_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
export const deleteDashboardTypeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DASHBOARD_TYPE_V2_DELETE_REQUEST });
  try {
    await axios.delete(`${baseUrl}/v2/dashboard-type/${id}`, {
      headers: getHeaders(),
    });
    dispatch({ type: DASHBOARD_TYPE_V2_DELETE_SUCCESS, payload: id });
    return id;
  } catch (error: any) {
    dispatch({
      type:    DASHBOARD_TYPE_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};