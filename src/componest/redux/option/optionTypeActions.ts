import axios from 'axios';
import { Dispatch } from 'redux';
import { refreshOrderFormData } from '../oders/orderFormDataActions';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Action Types
export const CREATE_OPTION_TYPE_REQUEST = 'CREATE_OPTION_TYPE_REQUEST';
export const CREATE_OPTION_TYPE_SUCCESS = 'CREATE_OPTION_TYPE_SUCCESS';
export const CREATE_OPTION_TYPE_FAILURE = 'CREATE_OPTION_TYPE_FAILURE';

export const GET_OPTION_TYPES_REQUEST = 'GET_OPTION_TYPES_REQUEST';
export const GET_OPTION_TYPES_SUCCESS = 'GET_OPTION_TYPES_SUCCESS';
export const GET_OPTION_TYPES_FAILURE = 'GET_OPTION_TYPES_FAILURE';

export const UPDATE_OPTION_TYPE_REQUEST = 'UPDATE_OPTION_TYPE_REQUEST';
export const UPDATE_OPTION_TYPE_SUCCESS = 'UPDATE_OPTION_TYPE_SUCCESS';
export const UPDATE_OPTION_TYPE_FAILURE = 'UPDATE_OPTION_TYPE_FAILURE';

export const DELETE_OPTION_TYPE_REQUEST = 'DELETE_OPTION_TYPE_REQUEST';
export const DELETE_OPTION_TYPE_SUCCESS = 'DELETE_OPTION_TYPE_SUCCESS';
export const DELETE_OPTION_TYPE_FAILURE = 'DELETE_OPTION_TYPE_FAILURE';

// Action Creators
export const createOptionType = (optionTypeData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_OPTION_TYPE_REQUEST });

  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${baseUrl}/option-type`, optionTypeData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: CREATE_OPTION_TYPE_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CREATE_OPTION_TYPE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOptionTypes = (params?: { category?: string; isGlobal?: boolean }) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_OPTION_TYPES_REQUEST });

  try {
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${baseUrl}/option-type${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_OPTION_TYPES_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_OPTION_TYPES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const updateOptionType = (id: string, optionTypeData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_OPTION_TYPE_REQUEST });

  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${baseUrl}/option-type/${id}`, optionTypeData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: UPDATE_OPTION_TYPE_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_OPTION_TYPE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteOptionType = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_OPTION_TYPE_REQUEST });

  try {
    const token = localStorage.getItem('authToken');
    await axios.delete(`${baseUrl}/option-type/${id}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: DELETE_OPTION_TYPE_SUCCESS,
      payload: id,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return id;
  } catch (error: any) {
    dispatch({
      type: DELETE_OPTION_TYPE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
