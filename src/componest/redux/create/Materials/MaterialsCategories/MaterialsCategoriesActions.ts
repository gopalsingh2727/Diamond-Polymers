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
} from "./MaterialsCategoriesContants";
import { Dispatch } from "redux";
import { RootState } from "../../../rootReducer";

export const addMaterialCategory = (materialTypeName: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ADD_MATERIAL_CATEGORY_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = { materialTypeName, branchId };

    const { data } = await axios.post(
      "http://localhost:3000/dev/material-type",
      payload,
      config
    );

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

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.get(
      "http://localhost:3000/dev/material-type",
      config
    );

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

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
    console.log("Fetched Material Types:",);
    
    const { data } = await axios.get(
      "http://localhost:3000/dev/getAllMaterialTypesWithMaterials",
      config
    );
         console.log( data,"Fetched Material Types:",);
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



