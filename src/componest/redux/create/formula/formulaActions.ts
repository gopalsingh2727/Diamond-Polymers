import axios from "axios";
import {
  CREATE_FORMULA_REQUEST,
  CREATE_FORMULA_SUCCESS,
  CREATE_FORMULA_FAIL,
  GET_FORMULAS_REQUEST,
  GET_FORMULAS_SUCCESS,
  GET_FORMULAS_FAIL,
  GET_FORMULA_BY_NAME_REQUEST,
  GET_FORMULA_BY_NAME_SUCCESS,
  GET_FORMULA_BY_NAME_FAIL,
  UPDATE_FORMULA_REQUEST,
  UPDATE_FORMULA_SUCCESS,
  UPDATE_FORMULA_FAIL,
  DELETE_FORMULA_REQUEST,
  DELETE_FORMULA_SUCCESS,
  DELETE_FORMULA_FAIL,
  TEST_FORMULA_REQUEST,
  TEST_FORMULA_SUCCESS,
  TEST_FORMULA_FAIL
} from "./formulaConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

// Headers builder
const getHeaders = (
  token?: string | null,
  extra?: Record<string, string>
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(extra || {}),
});

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
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_FORMULA_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/formula`,
      formulaData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_FORMULA_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: CREATE_FORMULA_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Formulas
export const getFormulas = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_FORMULAS_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/formula`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_FORMULAS_SUCCESS, payload: data.formulas || [] });
  } catch (error: any) {
    dispatch({
      type: GET_FORMULAS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get Formula by Name
export const getFormulaByName = (formulaName: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_FORMULA_BY_NAME_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/formula/${formulaName}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_FORMULA_BY_NAME_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: GET_FORMULA_BY_NAME_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Formula
export const updateFormula = (
  formulaName: string,
  updateData: {
    functionBody?: string;
    metadata?: any;
  }
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_FORMULA_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/formula/${formulaName}`,
      updateData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_FORMULA_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_FORMULA_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Formula
export const deleteFormula = (formulaName: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_FORMULA_REQUEST });

    const token = getToken(getState);

    await axios.delete(`${baseUrl}/formula/${formulaName}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_FORMULA_SUCCESS, payload: formulaName });
  } catch (error: any) {
    dispatch({
      type: DELETE_FORMULA_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Test Formula
export const testFormula = (testData: {
  functionBody: string;
  parameters: any;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: TEST_FORMULA_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/formula/test`,
      testData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: TEST_FORMULA_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: TEST_FORMULA_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
