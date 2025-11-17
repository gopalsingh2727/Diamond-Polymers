import axios from "axios";
import {
  CREATE_MATERIAL_SPEC_REQUEST,
  CREATE_MATERIAL_SPEC_SUCCESS,
  CREATE_MATERIAL_SPEC_FAIL,
  GET_MATERIAL_SPECS_REQUEST,
  GET_MATERIAL_SPECS_SUCCESS,
  GET_MATERIAL_SPECS_FAIL,
  GET_MATERIAL_SPEC_BY_ID_REQUEST,
  GET_MATERIAL_SPEC_BY_ID_SUCCESS,
  GET_MATERIAL_SPEC_BY_ID_FAIL,
  GET_MATERIAL_SPECS_BY_TYPE_REQUEST,
  GET_MATERIAL_SPECS_BY_TYPE_SUCCESS,
  GET_MATERIAL_SPECS_BY_TYPE_FAIL,
  UPDATE_MATERIAL_SPEC_REQUEST,
  UPDATE_MATERIAL_SPEC_SUCCESS,
  UPDATE_MATERIAL_SPEC_FAIL,
  DELETE_MATERIAL_SPEC_REQUEST,
  DELETE_MATERIAL_SPEC_SUCCESS,
  DELETE_MATERIAL_SPEC_FAIL,
  ACTIVATE_MATERIAL_SPEC_REQUEST,
  ACTIVATE_MATERIAL_SPEC_SUCCESS,
  ACTIVATE_MATERIAL_SPEC_FAIL,
  DEACTIVATE_MATERIAL_SPEC_REQUEST,
  DEACTIVATE_MATERIAL_SPEC_SUCCESS,
  DEACTIVATE_MATERIAL_SPEC_FAIL
} from "./materialSpecConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = (getState: () => RootState): string | null => {
  const selectedBranch = getState().auth?.userData?.selectedBranch;
  if (selectedBranch) return selectedBranch;
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

// Create Material Spec
export const createMaterialSpec = (materialSpecData: {
  materialTypeId: string;
  specName: string;
  description?: string;
  mol?: number;
  weightPerPiece?: number;
  density?: number;
  dimensions?: Array<{
    name: string;
    value: string | number | boolean;
    unit?: string;
    dataType: "string" | "number" | "boolean" | "date";
  }>;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_MATERIAL_SPEC_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const { data } = await axios.post(
      `${baseUrl}/materialspec`,
      { ...materialSpecData, branchId },
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_MATERIAL_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: CREATE_MATERIAL_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get All Material Specs
export const getMaterialSpecs = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MATERIAL_SPECS_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const { data } = await axios.get(`${baseUrl}/materialspec`, {
      headers: getHeaders(token),
      params: { branchId },
    });

    dispatch({ type: GET_MATERIAL_SPECS_SUCCESS, payload: data.materialSpecs || [] });
  } catch (error: any) {
    dispatch({
      type: GET_MATERIAL_SPECS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get Material Spec by ID
export const getMaterialSpecById = (materialSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MATERIAL_SPEC_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/materialspec/${materialSpecId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_MATERIAL_SPEC_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: GET_MATERIAL_SPEC_BY_ID_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Material Specs by Material Type
export const getMaterialSpecsByMaterialType = (materialTypeId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MATERIAL_SPECS_BY_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/materialspec/materialtype/${materialTypeId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_MATERIAL_SPECS_BY_TYPE_SUCCESS, payload: data.materialSpecs || [] });
    return data.materialSpecs || [];
  } catch (error: any) {
    dispatch({
      type: GET_MATERIAL_SPECS_BY_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Material Spec
export const updateMaterialSpec = (
  materialSpecId: string,
  updateData: {
    specName?: string;
    description?: string;
    mol?: number;
    weightPerPiece?: number;
    density?: number;
    dimensions?: Array<{
      name: string;
      value: string | number | boolean;
      unit?: string;
      dataType: "string" | "number" | "boolean" | "date";
    }>;
  }
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_MATERIAL_SPEC_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/materialspec/${materialSpecId}`,
      updateData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_MATERIAL_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_MATERIAL_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Material Spec
export const deleteMaterialSpec = (materialSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_MATERIAL_SPEC_REQUEST });

    const token = getToken(getState);

    await axios.delete(`${baseUrl}/materialspec/${materialSpecId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_MATERIAL_SPEC_SUCCESS, payload: materialSpecId });
  } catch (error: any) {
    dispatch({
      type: DELETE_MATERIAL_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Activate Material Spec
export const activateMaterialSpec = (materialSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ACTIVATE_MATERIAL_SPEC_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/materialspec/${materialSpecId}/activate`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: ACTIVATE_MATERIAL_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: ACTIVATE_MATERIAL_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Deactivate Material Spec
export const deactivateMaterialSpec = (materialSpecId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DEACTIVATE_MATERIAL_SPEC_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/materialspec/${materialSpecId}/deactivate`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: DEACTIVATE_MATERIAL_SPEC_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: DEACTIVATE_MATERIAL_SPEC_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Calculate from Material Spec
export const calculateFromMaterialSpec = (calculationData: {
  materialSpecId: string;
  quantity: number;
  additionalParams?: Record<string, any>;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/calculation/materialspec`,
      calculationData,
      { headers: getHeaders(token) }
    );

    return data;
  } catch (error: any) {
    throw error;
  }
};

// Calculate Combined (ProductSpec + MaterialSpec)
export const calculateCombined = (calculationData: {
  productSpecId: string;
  materialSpecId: string;
  quantity: number;
  formulaType?: "volume" | "weight" | "auto";
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/calculation/combined`,
      calculationData,
      { headers: getHeaders(token) }
    );

    return data;
  } catch (error: any) {
    throw error;
  }
};
