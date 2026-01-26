/**
 * Unified Inventory Type Actions (v2 API)
 * Units of Measure like TallyPrime (kg, pcs, ltr, etc.)
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
    'Content-Type': 'application/json'
  };
  if (selectedBranch) {
    headers['x-selected-branch'] = selectedBranch;
  }
  return headers;
};

// Action Types
export const INVENTORY_TYPE_V2_CREATE_REQUEST = 'INVENTORY_TYPE_V2_CREATE_REQUEST';
export const INVENTORY_TYPE_V2_CREATE_SUCCESS = 'INVENTORY_TYPE_V2_CREATE_SUCCESS';
export const INVENTORY_TYPE_V2_CREATE_FAILURE = 'INVENTORY_TYPE_V2_CREATE_FAILURE';

export const INVENTORY_TYPE_V2_LIST_REQUEST = 'INVENTORY_TYPE_V2_LIST_REQUEST';
export const INVENTORY_TYPE_V2_LIST_SUCCESS = 'INVENTORY_TYPE_V2_LIST_SUCCESS';
export const INVENTORY_TYPE_V2_LIST_FAILURE = 'INVENTORY_TYPE_V2_LIST_FAILURE';

export const INVENTORY_TYPE_V2_GET_REQUEST = 'INVENTORY_TYPE_V2_GET_REQUEST';
export const INVENTORY_TYPE_V2_GET_SUCCESS = 'INVENTORY_TYPE_V2_GET_SUCCESS';
export const INVENTORY_TYPE_V2_GET_FAILURE = 'INVENTORY_TYPE_V2_GET_FAILURE';

export const INVENTORY_TYPE_V2_UPDATE_REQUEST = 'INVENTORY_TYPE_V2_UPDATE_REQUEST';
export const INVENTORY_TYPE_V2_UPDATE_SUCCESS = 'INVENTORY_TYPE_V2_UPDATE_SUCCESS';
export const INVENTORY_TYPE_V2_UPDATE_FAILURE = 'INVENTORY_TYPE_V2_UPDATE_FAILURE';

export const INVENTORY_TYPE_V2_DELETE_REQUEST = 'INVENTORY_TYPE_V2_DELETE_REQUEST';
export const INVENTORY_TYPE_V2_DELETE_SUCCESS = 'INVENTORY_TYPE_V2_DELETE_SUCCESS';
export const INVENTORY_TYPE_V2_DELETE_FAILURE = 'INVENTORY_TYPE_V2_DELETE_FAILURE';

export const INVENTORY_TYPE_V2_SEED_REQUEST = 'INVENTORY_TYPE_V2_SEED_REQUEST';
export const INVENTORY_TYPE_V2_SEED_SUCCESS = 'INVENTORY_TYPE_V2_SEED_SUCCESS';
export const INVENTORY_TYPE_V2_SEED_FAILURE = 'INVENTORY_TYPE_V2_SEED_FAILURE';

// TypeScript interfaces
export interface InventoryType {
  _id: string;
  name: string;
  symbol: string;
  category: 'weight' | 'pieces' | 'volume' | 'length' | 'area' | 'custom';
  decimalPlaces: number;
  baseUnit?: string;
  conversionFactor: number;
  branchId: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryTypeData {
  name: string;
  symbol: string;
  category?: 'weight' | 'pieces' | 'volume' | 'length' | 'area' | 'custom';
  decimalPlaces?: number;
  baseUnit?: string;
  conversionFactor?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

// Create Inventory Type
export const createInventoryTypeV2 = (data: CreateInventoryTypeData) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TYPE_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/inventory-type`, data, {
      headers: getHeaders()
    });

    const inventoryType = response.data.inventoryType || response.data.data || response.data;
    dispatch({
      type: INVENTORY_TYPE_V2_CREATE_SUCCESS,
      payload: inventoryType
    });

    return inventoryType;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TYPE_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get All Inventory Types
export const getInventoryTypesV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TYPE_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/v2/inventory-type${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    const inventoryTypes = response.data.inventoryTypes || response.data.data?.data || response.data.data || [];
    dispatch({
      type: INVENTORY_TYPE_V2_LIST_SUCCESS,
      payload: inventoryTypes
    });

    return inventoryTypes;
  } catch (error: any) {
    // If endpoint doesn't exist (404), return empty array gracefully
    if (error.response?.status === 404) {

      dispatch({
        type: INVENTORY_TYPE_V2_LIST_SUCCESS,
        payload: []
      });
      return [];
    }
    dispatch({
      type: INVENTORY_TYPE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get Single Inventory Type
export const getInventoryTypeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TYPE_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/inventory-type/${id}`, {
      headers: getHeaders()
    });

    const inventoryType = response.data.inventoryType || response.data.data || response.data;
    dispatch({
      type: INVENTORY_TYPE_V2_GET_SUCCESS,
      payload: inventoryType
    });

    return inventoryType;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TYPE_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Update Inventory Type
export const updateInventoryTypeV2 = (id: string, data: Partial<CreateInventoryTypeData>) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TYPE_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/inventory-type/${id}`, data, {
      headers: getHeaders()
    });

    const inventoryType = response.data.inventoryType || response.data.data || response.data;
    dispatch({
      type: INVENTORY_TYPE_V2_UPDATE_SUCCESS,
      payload: inventoryType
    });

    return inventoryType;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TYPE_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Delete Inventory Type
export const deleteInventoryTypeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TYPE_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/v2/inventory-type/${id}`, {
      headers: getHeaders()
    });

    dispatch({
      type: INVENTORY_TYPE_V2_DELETE_SUCCESS,
      payload: id
    });

    return id;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TYPE_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Seed Default Inventory Types (kg, pcs, ltr, etc.)
export const seedInventoryTypesV2 = () => async (dispatch: Dispatch) => {
  dispatch({ type: INVENTORY_TYPE_V2_SEED_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/v2/inventory-type/seed-defaults`, {}, {
      headers: getHeaders()
    });

    const data = response.data.inventoryTypes || response.data.data || response.data;
    dispatch({
      type: INVENTORY_TYPE_V2_SEED_SUCCESS,
      payload: data
    });

    // Refresh the list after seeding
    dispatch(getInventoryTypesV2() as any);

    return data;
  } catch (error: any) {
    dispatch({
      type: INVENTORY_TYPE_V2_SEED_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};