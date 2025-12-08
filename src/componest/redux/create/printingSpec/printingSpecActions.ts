import axios from "axios";
import {
  ADD_PRINTING_SPEC_REQUEST,
  ADD_PRINTING_SPEC_SUCCESS,
  ADD_PRINTING_SPEC_FAIL,
  GET_PRINTING_SPECS_REQUEST,
  GET_PRINTING_SPECS_SUCCESS,
  GET_PRINTING_SPECS_FAIL,
  UPDATE_PRINTING_SPEC_REQUEST,
  UPDATE_PRINTING_SPEC_SUCCESS,
  UPDATE_PRINTING_SPEC_FAIL,
  DELETE_PRINTING_SPEC_REQUEST,
  DELETE_PRINTING_SPEC_SUCCESS,
  DELETE_PRINTING_SPEC_FAIL
} from "./printingSpecConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getHeaders = (token?: string | null): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
});

// Add Printing Spec
export const addPrintingSpec = (
  printingTypeId: string,
  specName: string,
  description?: string,
  colors?: string[],
  resolution?: { width: number; height: number; unit: string },
  printArea?: { width: number; height: number; unit: string },
  inkType?: string,
  substrates?: string[],
  dryingMethod?: string,
  customSpecs?: any
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: ADD_PRINTING_SPEC_REQUEST });

    const token = getToken(getState);

    const response = await axios.post(
      `${baseUrl}/printingspec`,
      {
        printingTypeId,
        specName,
        description,
        colors,
        resolution,
        printArea,
        inkType,
        substrates,
        dryingMethod,
        customSpecs
      },
      { headers: getHeaders(token) }
    );

    dispatch({
      type: ADD_PRINTING_SPEC_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: ADD_PRINTING_SPEC_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get All Printing Specs
export const getPrintingSpecs = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRINTING_SPECS_REQUEST });

    const token = getToken(getState);

    const response = await axios.get(
      `${baseUrl}/printingspec`,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: GET_PRINTING_SPECS_SUCCESS,
      payload: response.data.printingSpecs || []
    });

    return response.data.printingSpecs;
  } catch (error: any) {
    dispatch({
      type: GET_PRINTING_SPECS_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Update Printing Spec
export const updatePrintingSpec = (
  id: string,
  data: any
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRINTING_SPEC_REQUEST });

    const token = getToken(getState);

    const response = await axios.put(
      `${baseUrl}/printingspec/${id}`,
      data,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: UPDATE_PRINTING_SPEC_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_PRINTING_SPEC_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Delete Printing Spec
export const deletePrintingSpec = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_PRINTING_SPEC_REQUEST });

    const token = getToken(getState);

    await axios.delete(
      `${baseUrl}/printingspec/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: DELETE_PRINTING_SPEC_SUCCESS,
      payload: id
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_PRINTING_SPEC_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};
