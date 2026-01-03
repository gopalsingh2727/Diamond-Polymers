/**
 * Inventory Location Actions (v2 API)
 * CRUD for warehouse locations
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
export const INVENTORY_LOCATION_V2_CREATE_REQUEST = 'INVENTORY_LOCATION_V2_CREATE_REQUEST';
export const INVENTORY_LOCATION_V2_CREATE_SUCCESS = 'INVENTORY_LOCATION_V2_CREATE_SUCCESS';
export const INVENTORY_LOCATION_V2_CREATE_FAILURE = 'INVENTORY_LOCATION_V2_CREATE_FAILURE';

export const INVENTORY_LOCATION_V2_LIST_REQUEST = 'INVENTORY_LOCATION_V2_LIST_REQUEST';
export const INVENTORY_LOCATION_V2_LIST_SUCCESS = 'INVENTORY_LOCATION_V2_LIST_SUCCESS';
export const INVENTORY_LOCATION_V2_LIST_FAILURE = 'INVENTORY_LOCATION_V2_LIST_FAILURE';

export const INVENTORY_LOCATION_V2_GET_REQUEST = 'INVENTORY_LOCATION_V2_GET_REQUEST';
export const INVENTORY_LOCATION_V2_GET_SUCCESS = 'INVENTORY_LOCATION_V2_GET_SUCCESS';
export const INVENTORY_LOCATION_V2_GET_FAILURE = 'INVENTORY_LOCATION_V2_GET_FAILURE';

export const INVENTORY_LOCATION_V2_UPDATE_REQUEST = 'INVENTORY_LOCATION_V2_UPDATE_REQUEST';
export const INVENTORY_LOCATION_V2_UPDATE_SUCCESS = 'INVENTORY_LOCATION_V2_UPDATE_SUCCESS';
export const INVENTORY_LOCATION_V2_UPDATE_FAILURE = 'INVENTORY_LOCATION_V2_UPDATE_FAILURE';

export const INVENTORY_LOCATION_V2_DELETE_REQUEST = 'INVENTORY_LOCATION_V2_DELETE_REQUEST';
export const INVENTORY_LOCATION_V2_DELETE_SUCCESS = 'INVENTORY_LOCATION_V2_DELETE_SUCCESS';
export const INVENTORY_LOCATION_V2_DELETE_FAILURE = 'INVENTORY_LOCATION_V2_DELETE_FAILURE';

// Create Location
export const createInventoryLocationV2 = (data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_LOCATION_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/inventory-location`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_LOCATION_V2_CREATE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_LOCATION_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Locations
export const getInventoryLocationsV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_LOCATION_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/inventory-location${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_LOCATION_V2_LIST_SUCCESS,
      payload: response.data.data.data || response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_LOCATION_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Single Location
export const getInventoryLocationV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_LOCATION_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/inventory-location/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_LOCATION_V2_GET_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_LOCATION_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Location
export const updateInventoryLocationV2 = (id: string, data: any) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_LOCATION_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/inventory-location/${id}`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_LOCATION_V2_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_LOCATION_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Location
export const deleteInventoryLocationV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_LOCATION_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/inventory-location/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: INVENTORY_LOCATION_V2_DELETE_SUCCESS,
      payload: id,
    });

    return id;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_LOCATION_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
