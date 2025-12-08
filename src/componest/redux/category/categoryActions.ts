import axios from 'axios';
import { Dispatch } from 'redux';
import { refreshOrderFormData } from '../oders/orderFormDataActions';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Action Types
export const CREATE_CATEGORY_REQUEST = 'CREATE_CATEGORY_REQUEST';
export const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS';
export const CREATE_CATEGORY_FAILURE = 'CREATE_CATEGORY_FAILURE';

export const GET_CATEGORIES_REQUEST = 'GET_CATEGORIES_REQUEST';
export const GET_CATEGORIES_SUCCESS = 'GET_CATEGORIES_SUCCESS';
export const GET_CATEGORIES_FAILURE = 'GET_CATEGORIES_FAILURE';

export const UPDATE_CATEGORY_REQUEST = 'UPDATE_CATEGORY_REQUEST';
export const UPDATE_CATEGORY_SUCCESS = 'UPDATE_CATEGORY_SUCCESS';
export const UPDATE_CATEGORY_FAILURE = 'UPDATE_CATEGORY_FAILURE';

export const DELETE_CATEGORY_REQUEST = 'DELETE_CATEGORY_REQUEST';
export const DELETE_CATEGORY_SUCCESS = 'DELETE_CATEGORY_SUCCESS';
export const DELETE_CATEGORY_FAILURE = 'DELETE_CATEGORY_FAILURE';

// Action Creators
export const createCategory = (categoryData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_CATEGORY_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${baseUrl}/category`, categoryData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: CREATE_CATEGORY_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CREATE_CATEGORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getCategories = (params?: { branchId?: string; isActive?: boolean }) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_CATEGORIES_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${baseUrl}/category${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_CATEGORIES_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_CATEGORIES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const updateCategory = (id: string, categoryData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_CATEGORY_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${baseUrl}/category/${id}`, categoryData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: UPDATE_CATEGORY_SUCCESS,
      payload: response.data.data,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_CATEGORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteCategory = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_CATEGORY_REQUEST });

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${baseUrl}/category/${id}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: DELETE_CATEGORY_SUCCESS,
      payload: id,
    });

    // Refresh cached form data
    dispatch(refreshOrderFormData() as any);

    return id;
  } catch (error: any) {
    dispatch({
      type: DELETE_CATEGORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
