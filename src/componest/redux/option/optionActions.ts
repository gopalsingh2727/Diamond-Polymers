import axios from 'axios';
import { Dispatch } from 'redux';
import { refreshOrderFormData } from '../oders/orderFormDataActions';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Headers builder
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  const selectedBranch = localStorage.getItem('selectedBranch');
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
export const CREATE_OPTION_REQUEST = 'CREATE_OPTION_REQUEST';
export const CREATE_OPTION_SUCCESS = 'CREATE_OPTION_SUCCESS';
export const CREATE_OPTION_FAILURE = 'CREATE_OPTION_FAILURE';

export const GET_OPTIONS_REQUEST = 'GET_OPTIONS_REQUEST';
export const GET_OPTIONS_SUCCESS = 'GET_OPTIONS_SUCCESS';
export const GET_OPTIONS_FAILURE = 'GET_OPTIONS_FAILURE';

export const UPDATE_OPTION_REQUEST = 'UPDATE_OPTION_REQUEST';
export const UPDATE_OPTION_SUCCESS = 'UPDATE_OPTION_SUCCESS';
export const UPDATE_OPTION_FAILURE = 'UPDATE_OPTION_FAILURE';

export const DELETE_OPTION_REQUEST = 'DELETE_OPTION_REQUEST';
export const DELETE_OPTION_SUCCESS = 'DELETE_OPTION_SUCCESS';
export const DELETE_OPTION_FAILURE = 'DELETE_OPTION_FAILURE';

export const UPLOAD_OPTION_FILES_REQUEST = 'UPLOAD_OPTION_FILES_REQUEST';
export const UPLOAD_OPTION_FILES_SUCCESS = 'UPLOAD_OPTION_FILES_SUCCESS';
export const UPLOAD_OPTION_FILES_FAILURE = 'UPLOAD_OPTION_FILES_FAILURE';

export const ADD_OPTION_LINK_REQUEST = 'ADD_OPTION_LINK_REQUEST';
export const ADD_OPTION_LINK_SUCCESS = 'ADD_OPTION_LINK_SUCCESS';
export const ADD_OPTION_LINK_FAILURE = 'ADD_OPTION_LINK_FAILURE';

// Action Creators
export const createOption = (optionData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_OPTION_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/option`, optionData, {
      headers: getHeaders(),
    });

    dispatch({
      type: CREATE_OPTION_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CREATE_OPTION_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOptions = (params?: {
  category?: string;
  optionTypeId?: string;
  orderTypeId?: string;
  branchId?: string;
  search?: string;
}) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_OPTIONS_REQUEST });

  try {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${baseUrl}/option${queryParams ? `?${queryParams}` : ''}`;

    console.log('🌐 API Request - getOptions');
    console.log('  URL:', url);
    console.log('  Params:', params);

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    console.log('✅ API Response - getOptions');
    console.log('  Status:', response.status);
    console.log('  Data count:', response.data.data?.length || 0);
    console.log('  Data:', response.data.data);

    dispatch({
      type: GET_OPTIONS_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    console.error('❌ API Error - getOptions:', error.response?.data || error.message);
    dispatch({
      type: GET_OPTIONS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const updateOption = (id: string, optionData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_OPTION_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/option/${id}`, optionData, {
      headers: getHeaders(),
    });

    dispatch({
      type: UPDATE_OPTION_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_OPTION_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteOption = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_OPTION_REQUEST });

  try {
    await axios.delete(`${baseUrl}/option/${id}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: DELETE_OPTION_SUCCESS,
      payload: id,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return id;
  } catch (error: any) {
    dispatch({
      type: DELETE_OPTION_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const uploadOptionFiles = (id: string, files: any[]) => async (dispatch: Dispatch) => {
  dispatch({ type: UPLOAD_OPTION_FILES_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/option/${id}/files`, { files }, {
      headers: getHeaders(),
    });

    dispatch({
      type: UPLOAD_OPTION_FILES_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: UPLOAD_OPTION_FILES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const addOptionLink = (id: string, link: any) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_OPTION_LINK_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/option/${id}/links`, link, {
      headers: getHeaders(),
    });

    dispatch({
      type: ADD_OPTION_LINK_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: ADD_OPTION_LINK_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
