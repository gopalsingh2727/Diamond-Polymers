import axios from 'axios';
import { Dispatch } from 'redux';
import { refreshOrderFormData } from '../../oders/orderFormDataActions';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Action Types
export const CREATE_OPTION_SPEC_REQUEST = 'CREATE_OPTION_SPEC_REQUEST';
export const CREATE_OPTION_SPEC_SUCCESS = 'CREATE_OPTION_SPEC_SUCCESS';
export const CREATE_OPTION_SPEC_FAILURE = 'CREATE_OPTION_SPEC_FAILURE';

export const GET_OPTION_SPECS_REQUEST = 'GET_OPTION_SPECS_REQUEST';
export const GET_OPTION_SPECS_SUCCESS = 'GET_OPTION_SPECS_SUCCESS';
export const GET_OPTION_SPECS_FAILURE = 'GET_OPTION_SPECS_FAILURE';

export const GET_OPTION_SPEC_BY_ID_REQUEST = 'GET_OPTION_SPEC_BY_ID_REQUEST';
export const GET_OPTION_SPEC_BY_ID_SUCCESS = 'GET_OPTION_SPEC_BY_ID_SUCCESS';
export const GET_OPTION_SPEC_BY_ID_FAILURE = 'GET_OPTION_SPEC_BY_ID_FAILURE';

export const UPDATE_OPTION_SPEC_REQUEST = 'UPDATE_OPTION_SPEC_REQUEST';
export const UPDATE_OPTION_SPEC_SUCCESS = 'UPDATE_OPTION_SPEC_SUCCESS';
export const UPDATE_OPTION_SPEC_FAILURE = 'UPDATE_OPTION_SPEC_FAILURE';

export const DELETE_OPTION_SPEC_REQUEST = 'DELETE_OPTION_SPEC_REQUEST';
export const DELETE_OPTION_SPEC_SUCCESS = 'DELETE_OPTION_SPEC_SUCCESS';
export const DELETE_OPTION_SPEC_FAILURE = 'DELETE_OPTION_SPEC_FAILURE';

// Action Creators

/**
 * Create a new OptionSpec
 */
export const createOptionSpec = (optionSpecData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_OPTION_SPEC_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${baseUrl}/option-spec`, optionSpecData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: CREATE_OPTION_SPEC_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CREATE_OPTION_SPEC_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Get all OptionSpecs with optional filters
 */
export const getOptionSpecs = (params?: {
  optionTypeId?: string;
  branchId?: string;
  search?: string;
  isActive?: boolean;
}) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_OPTION_SPECS_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${baseUrl}/option-spec${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_OPTION_SPECS_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_OPTION_SPECS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Get a single OptionSpec by ID
 */
export const getOptionSpecById = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_OPTION_SPEC_BY_ID_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${baseUrl}/option-spec/${id}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_OPTION_SPEC_BY_ID_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_OPTION_SPEC_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Update an existing OptionSpec
 */
export const updateOptionSpec = (id: string, optionSpecData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_OPTION_SPEC_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${baseUrl}/option-spec/${id}`, optionSpecData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: UPDATE_OPTION_SPEC_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_OPTION_SPEC_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Delete an OptionSpec
 */
export const deleteOptionSpec = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_OPTION_SPEC_REQUEST });

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${baseUrl}/option-spec/${id}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: DELETE_OPTION_SPEC_SUCCESS,
      payload: id,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return id;
  } catch (error: any) {
    dispatch({
      type: DELETE_OPTION_SPEC_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
