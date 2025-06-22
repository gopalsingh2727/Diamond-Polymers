import axios from "axios";
import {
  CREATE_MATERIAL_REQUEST,
  CREATE_MATERIAL_SUCCESS,
  CREATE_MATERIAL_FAIL,
  GET_MATERIALS_REQUEST,
  GET_MATERIALS_SUCCESS,
  GET_MATERIALS_FAIL,
  UPDATE_MATERIAL_REQUEST,
  UPDATE_MATERIAL_SUCCESS,
  UPDATE_MATERIAL_FAIL,
  DELETE_MATERIAL_REQUEST,
  DELETE_MATERIAL_SUCCESS,
  DELETE_MATERIAL_FAIL,
} from "./MaterialContants";

import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ✅ Env Config
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY;

// ✅ Helper to get token
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

// ✅ Helper to get branch ID
const getBranchId = (): string | null =>
  localStorage.getItem("selectedBranch");

// ✅ Common headers generator
const getHeaders = (
  token?: string | null,
  branchId?: string | null,
  extraHeaders?: Record<string, string>
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(branchId ? { "x-branch-id": branchId } : {}),
  ...(extraHeaders || {}),
});

// ✅ Create Material
export const createMaterial = (materialData: {
  materialName: string;
  materialMol: number;
  materialType: string;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_MATERIAL_REQUEST });

    const token = getToken(getState);
      
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID not found");

    const payload = { ...materialData, branchId };

    const { data } = await axios.post(`${baseUrl}/material`, payload, {
      headers: getHeaders(token),
    });

    dispatch({ type: CREATE_MATERIAL_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_MATERIAL_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Get All Materials (for current branch)
export const getMaterials = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MATERIALS_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID not found");

    const { data } = await axios.get(`${baseUrl}/material`, {
      headers: getHeaders(token),
    });
    console.log(data , "amasd");
    

    dispatch({ type: GET_MATERIALS_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: GET_MATERIALS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Update Material
export const updateMaterial = (
  id: string,
  updatedData: {
    materialName?: string;
    materialMol?: number;
    materialType?: string;
  }
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_MATERIAL_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/material/${id}`,
      updatedData,
      {
        headers: getHeaders(token),
      }
    );

    dispatch({ type: UPDATE_MATERIAL_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_MATERIAL_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Material
export const deleteMaterial = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_MATERIAL_REQUEST });

    const token = getToken(getState);

    await axios.delete(`${baseUrl}/material/${id}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_MATERIAL_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_MATERIAL_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};