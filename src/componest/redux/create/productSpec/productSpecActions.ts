import axios from "axios";
import {
  CREATE_PRODUCT_SPEC_REQUEST,
  CREATE_PRODUCT_SPEC_SUCCESS,
  CREATE_PRODUCT_SPEC_FAIL,
  GET_PRODUCT_SPECS_REQUEST,
  GET_PRODUCT_SPECS_SUCCESS,
  GET_PRODUCT_SPECS_FAIL,
  GET_PRODUCT_SPEC_BY_ID_REQUEST,
  GET_PRODUCT_SPEC_BY_ID_SUCCESS,
  GET_PRODUCT_SPEC_BY_ID_FAIL,
  GET_PRODUCT_SPECS_BY_TYPE_REQUEST,
  GET_PRODUCT_SPECS_BY_TYPE_SUCCESS,
  GET_PRODUCT_SPECS_BY_TYPE_FAIL,
  UPDATE_PRODUCT_SPEC_REQUEST,
  UPDATE_PRODUCT_SPEC_SUCCESS,
  UPDATE_PRODUCT_SPEC_FAIL,
  DELETE_PRODUCT_SPEC_REQUEST,
  DELETE_PRODUCT_SPEC_SUCCESS,
  DELETE_PRODUCT_SPEC_FAIL,
  ACTIVATE_PRODUCT_SPEC_REQUEST,
  ACTIVATE_PRODUCT_SPEC_SUCCESS,
  ACTIVATE_PRODUCT_SPEC_FAIL,
  DEACTIVATE_PRODUCT_SPEC_REQUEST,
  DEACTIVATE_PRODUCT_SPEC_SUCCESS,
  DEACTIVATE_PRODUCT_SPEC_FAIL
} from "./productSpecConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = (getState: () => RootState): string | null => {
  const userData = getState().auth?.userData;
  // First check selectedBranch (for admin users)
  if (userData?.selectedBranch) return userData.selectedBranch;
  // Then check user's own branchId (for manager users)
  if (userData?.branchId) return userData.branchId;
  // Finally check localStorage
  return localStorage.getItem("selectedBranch");
};

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

// Create Product Spec
export const createProductSpec = (productSpecData: {
  productTypeId: string;
  specName: string;
  description?: string;
  dimensions: Array<{
    name: string;
    value: string | number | boolean;
    unit?: string;
    dataType: "string" | "number" | "boolean" | "date";
  }>;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_PRODUCT_SPEC_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const { data } = await axios.post(
      `${baseUrl}/productspec`,
      { ...productSpecData, branchId },
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_PRODUCT_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: CREATE_PRODUCT_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Product Specs
export const getProductSpecs = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCT_SPECS_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const { data } = await axios.get(`${baseUrl}/productspec`, {
      headers: getHeaders(token),
      params: { branchId },
    });

    dispatch({ type: GET_PRODUCT_SPECS_SUCCESS, payload: data.productSpecs || [] });
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCT_SPECS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get Product Spec by ID
export const getProductSpecById = (productSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCT_SPEC_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/productspec/${productSpecId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_PRODUCT_SPEC_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCT_SPEC_BY_ID_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Product Specs by Product Type
export const getProductSpecsByProductType = (productTypeId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCT_SPECS_BY_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/productspec/producttype/${productTypeId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_PRODUCT_SPECS_BY_TYPE_SUCCESS, payload: data.productSpecs || [] });
    return data.productSpecs || [];
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCT_SPECS_BY_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Product Spec
export const updateProductSpec = (
  productSpecId: string,
  updateData: {
    specName?: string;
    description?: string;
    dimensions?: Array<{
      name: string;
      value: string | number | boolean;
      unit?: string;
      dataType: "string" | "number" | "boolean" | "date";
    }>;
  }
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_SPEC_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/productspec/${productSpecId}`,
      updateData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_PRODUCT_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_PRODUCT_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Product Spec
export const deleteProductSpec = (productSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_PRODUCT_SPEC_REQUEST });

    const token = getToken(getState);

    await axios.delete(`${baseUrl}/productspec/${productSpecId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_PRODUCT_SPEC_SUCCESS, payload: productSpecId });
  } catch (error: any) {
    dispatch({
      type: DELETE_PRODUCT_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Activate Product Spec
export const activateProductSpec = (productSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ACTIVATE_PRODUCT_SPEC_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/productspec/${productSpecId}/activate`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: ACTIVATE_PRODUCT_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: ACTIVATE_PRODUCT_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Deactivate Product Spec
export const deactivateProductSpec = (productSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DEACTIVATE_PRODUCT_SPEC_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/productspec/${productSpecId}/deactivate`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: DEACTIVATE_PRODUCT_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: DEACTIVATE_PRODUCT_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
