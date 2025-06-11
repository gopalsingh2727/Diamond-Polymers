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
} from "./productCategoriesContants";
import { Dispatch } from "redux";
import { RootState } from "../../../rootReducer";

export const addProductCategory = (productTypeName: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ADD_PRODUCT_CATEGORY_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = {
      productTypeName,
      branchId,
    };

    const { data } = await axios.post(
      "http://localhost:3000/dev/producttype",
      payload,
      config
    );

    dispatch({ type: ADD_PRODUCT_CATEGORY_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: ADD_PRODUCT_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getProductCategories = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRODUCT_CATEGORIES_REQUEST });

    const token =
      getState().auth?.token || localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Authorization token missing");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(
      "http://localhost:3000/dev/producttype",
      config
    );


    
    dispatch({
      type: GET_PRODUCT_CATEGORIES_SUCCESS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: GET_PRODUCT_CATEGORIES_FAIL,
      payload:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product categories",
    });
  }
};



export const getAllProductTypesWithProducts = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Authorization token missing");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
console.log( "Fetched product types with products");
    const { data } = await axios.get(
      "http://localhost:3000/dev/getAllProductTypesWithProducts",
      config
    );
   console.log(data , "Fetched product types with products");
   
    dispatch({
      type: GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_SUCCESS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: GET_ALL_PRODUCT_TYPES_WITH_PRODUCTS_FAIL,
      payload:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product types with products",
    });
  }
};