import axios from "axios";
import {
  ADD_PRODUCT_CATEGORY_REQUEST,
  ADD_PRODUCT_CATEGORY_SUCCESS,
  ADD_PRODUCT_CATEGORY_FAIL,
  GET_PRODUCT_CATEGORIES_REQUEST,
  GET_PRODUCT_CATEGORIES_SUCCESS,
  GET_PRODUCT_CATEGORIES_FAIL,
  GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_REQUEST,
  GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_SUCCESS,
  GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_FAIL,
  UPDATE_PRODUCT_CATEGORY_REQUEST,
  UPDATE_PRODUCT_CATEGORY_SUCCESS,
  UPDATE_PRODUCT_CATEGORY_FAIL,
  DELETE_PRODUCT_CATEGORY_REQUEST,
  DELETE_PRODUCT_CATEGORY_SUCCESS,
  DELETE_PRODUCT_CATEGORY_FAIL,
} from "./productCategoriesContants";

import { Dispatch } from "redux";
import { RootState } from "../../../rootReducer";

// ✅ Env variables
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = (): string | null =>
  localStorage.getItem("selectedBranch");

const getHeaders = (
  token?: string | null,
  extraHeaders?: Record<string, string>
) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": API_KEY,
  ...(extraHeaders || {}),
});

// ✅ Add Product Category
export const addProductCategory = (productTypeName: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ADD_PRODUCT_CATEGORY_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID not found");

    const payload = { productTypeName, branchId };

    const { data } = await axios.post(
      `${baseUrl}/producttype`,
      payload,
      { headers: getHeaders(token) }
    );

    dispatch({ type: ADD_PRODUCT_CATEGORY_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: ADD_PRODUCT_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Get All Product Categories
export const getProductCategories = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCT_CATEGORIES_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(`${baseUrl}/producttype`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_PRODUCT_CATEGORIES_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCT_CATEGORIES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Get All Product Types With Products
export const getAllProductTypesWithProducts = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/getAllProductTypesWithProducts`,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_SUCCESS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Update Product Category
export const updateProductCategory = (
  id: string,
  updatedName: string
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_CATEGORY_REQUEST });

    const token = getToken(getState);

    const payload = { productTypeName: updatedName };

    const { data } = await axios.put(
      `${baseUrl}/dev/producttype/${id}`,
      payload,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_PRODUCT_CATEGORY_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_PRODUCT_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Product Category
export const deleteProductCategory = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_PRODUCT_CATEGORY_REQUEST });

    const token = getToken(getState);

    await axios.delete(`${baseUrl}/dev/producttype/${id}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_PRODUCT_CATEGORY_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_PRODUCT_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};