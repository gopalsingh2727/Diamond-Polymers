import { Dispatch } from 'redux';
import axios from 'axios';
import {
  CREATE_FORMULA_REQUEST,
  CREATE_FORMULA_SUCCESS,
  CREATE_FORMULA_FAILURE,
  GET_FORMULAS_REQUEST,
  GET_FORMULAS_SUCCESS,
  GET_FORMULAS_FAILURE,
  GET_FORMULA_BY_NAME_REQUEST,
  GET_FORMULA_BY_NAME_SUCCESS,
  GET_FORMULA_BY_NAME_FAILURE,
  UPDATE_FORMULA_REQUEST,
  UPDATE_FORMULA_SUCCESS,
  UPDATE_FORMULA_FAILURE,
  DELETE_FORMULA_REQUEST,
  DELETE_FORMULA_SUCCESS,
  DELETE_FORMULA_FAILURE,
  TEST_FORMULA_REQUEST,
  TEST_FORMULA_SUCCESS,
  TEST_FORMULA_FAILURE,
} from './formulaConstants';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Create Formula
export const createFormula = (formulaData: {
  name: string;
  functionBody: string;
  metadata?: {
    description?: string;
    requiredParams?: string[];
    optionalParams?: string[];
    unit?: string;
    category?: string;
    version?: string;
  };
}) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_FORMULA_REQUEST });

  try {
    const response = await axios.post(
      `${baseUrl}/api/formula`,
      formulaData,
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: CREATE_FORMULA_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: CREATE_FORMULA_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Formulas
export const getFormulas = () => async (dispatch: Dispatch) => {
  dispatch({ type: GET_FORMULAS_REQUEST });

  try {
    const response = await axios.get(
      `${baseUrl}/api/formula`,
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: GET_FORMULAS_SUCCESS,
      payload: response.data.formulas || response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: GET_FORMULAS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Formula by Name
export const getFormulaByName = (name: string) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_FORMULA_BY_NAME_REQUEST });

  try {
    const response = await axios.get(
      `${baseUrl}/api/formula/${name}`,
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: GET_FORMULA_BY_NAME_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: GET_FORMULA_BY_NAME_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Formula
export const updateFormula = (name: string, updateData: {
  functionBody?: string;
  metadata?: {
    description?: string;
    requiredParams?: string[];
    optionalParams?: string[];
    unit?: string;
    category?: string;
    version?: string;
  };
}) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_FORMULA_REQUEST });

  try {
    const response = await axios.put(
      `${baseUrl}/api/formula/${name}`,
      updateData,
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: UPDATE_FORMULA_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_FORMULA_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Formula
export const deleteFormula = (name: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_FORMULA_REQUEST });

  try {
    const response = await axios.delete(
      `${baseUrl}/api/formula/${name}`,
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: DELETE_FORMULA_SUCCESS,
      payload: name,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: DELETE_FORMULA_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Test Formula
export const testFormula = (name: string, params: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: TEST_FORMULA_REQUEST });

  try {
    const response = await axios.post(
      `${baseUrl}/api/formula/${name}/test`,
      { params },
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: TEST_FORMULA_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: TEST_FORMULA_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
