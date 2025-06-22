import axios from "axios";
import {
  ADD_MATERIAL_CATEGORY_REQUEST,
  ADD_MATERIAL_CATEGORY_SUCCESS,
  ADD_MATERIAL_CATEGORY_FAIL,
  GET_MATERIAL_CATEGORIES_REQUEST,
  GET_MATERIAL_CATEGORIES_SUCCESS,
  GET_MATERIAL_CATEGORIES_FAIL,
  GET_ALL_MATERIAL_TYPES_REQUEST,
  GET_ALL_MATERIAL_TYPES_SUCCESS,
  GET_ALL_MATERIAL_TYPES_FAIL,
  UPDATE_MATERIAL_CATEGORY_REQUEST,
  UPDATE_MATERIAL_CATEGORY_SUCCESS,
  UPDATE_MATERIAL_CATEGORY_FAIL,
  DELETE_MATERIAL_CATEGORY_REQUEST,
  DELETE_MATERIAL_CATEGORY_SUCCESS,
  DELETE_MATERIAL_CATEGORY_FAIL,
} from "./MaterialsCategoriesContants";

import { Dispatch } from "redux";
import { RootState } from "../../../rootReducer";

// Env config
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getHeaders = (
  token?: string | null,
  extra?: Record<string, string>
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(extra || {}),
});

// ✅ Add Material Category
export const addMaterialCategory = (materialTypeName: string ) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ADD_MATERIAL_CATEGORY_REQUEST });

    const token = getToken(getState);
    const payload = { materialTypeName };

    const { data } = await axios.post(`${baseUrl}/material-type`, payload, {
      headers: getHeaders(token),
    });
    dispatch({ type: ADD_MATERIAL_CATEGORY_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: ADD_MATERIAL_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};


export const getMaterialCategories = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MATERIAL_CATEGORIES_REQUEST });

    const token = getToken(getState);


    const { data } = await axios.get(`${baseUrl}/material-type`, {
      headers: getHeaders(token),
 
    });
   
     
    dispatch({ type: GET_MATERIAL_CATEGORIES_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: GET_MATERIAL_CATEGORIES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};


export const getAllMaterialTypesWithMaterials = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_ALL_MATERIAL_TYPES_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/getAllMaterialTypesWithMaterials`,
      {
        headers: getHeaders(token),
      }
    );
    console.log(data , "this  call you");
    
    
    dispatch({
      type: GET_ALL_MATERIAL_TYPES_SUCCESS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: GET_ALL_MATERIAL_TYPES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};





export const updateMaterialCategory = (id: string, materialTypeName: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: UPDATE_MATERIAL_CATEGORY_REQUEST });

    const token = getToken(getState);
    const payload = { materialTypeName };

    const { data } = await axios.put(
      `${baseUrl}/material-type/${id}`,
      payload,
      {
        headers: getHeaders(token),
      }
    );

    dispatch({ type: UPDATE_MATERIAL_CATEGORY_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_MATERIAL_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Material Category
export const deleteMaterialCategory = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_MATERIAL_CATEGORY_REQUEST });

    const token = getToken(getState);

    await axios.delete(`${baseUrl}/material-type/${id}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_MATERIAL_CATEGORY_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_MATERIAL_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};