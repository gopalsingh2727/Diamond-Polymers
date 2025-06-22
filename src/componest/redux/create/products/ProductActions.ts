import axios from "axios";
import {
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAIL,
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAIL,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAIL,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAIL,
} from "./ProductContants";

import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ✅ Env
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = (): string | null =>
  localStorage.getItem("selectedBranch");

const getHeaders = (token?: string | null, contentType = true) => {
  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : "",
    "x-api-key": API_KEY,
  };
  if (contentType) headers["Content-Type"] = "application/json";
  return headers;
};

// ✅ Create Product
export const createProduct = (product: {
  productName: string;
  price: number;
  productType: string;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID not found");

    const payload = { ...product, branchId };

    const { data } = await axios.post(
      `${baseUrl}/product`,
      payload,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_PRODUCT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Get All Products

export const getProducts = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCTS_REQUEST });

    const token = getToken(getState); // ✅ custom selector
    const headers = getHeaders(token, false); // false = no JSON body (usually)

    const { data } = await axios.get(`${baseUrl}/product`, { headers });

    console.log("Fetched products:", data);

    dispatch({ type: GET_PRODUCTS_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCTS_FAIL,
      payload: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

// ✅ Update Product
export const updateProduct = (
  id: string,
  updateData: {
    productName?: string;
    productType?: string;
    price?: number;
    sizeX?: number;
    sizeY?: number;
    sizeZ?: number;
  }
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID not found");

    const payload = { ...updateData, branchId };

    const { data } = await axios.put(
      `${baseUrl}/product/${id}`,
      payload,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_PRODUCT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Product
export const deleteProduct = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID not found");

    await axios.delete(
      `${baseUrl}/product/${id}`,
      { headers: getHeaders(token, false) }
    );

    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_PRODUCT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};