import axios from "axios";
import {
  CREATE_CUSTOMER_CATEGORY_REQUEST,
  CREATE_CUSTOMER_CATEGORY_SUCCESS,
  CREATE_CUSTOMER_CATEGORY_FAIL,
  GET_CUSTOMER_CATEGORIES_REQUEST,
  GET_CUSTOMER_CATEGORIES_SUCCESS,
  GET_CUSTOMER_CATEGORIES_FAIL,
  UPDATE_CUSTOMER_CATEGORY_REQUEST,
  UPDATE_CUSTOMER_CATEGORY_SUCCESS,
  UPDATE_CUSTOMER_CATEGORY_FAIL,
  DELETE_CUSTOMER_CATEGORY_REQUEST,
  DELETE_CUSTOMER_CATEGORY_SUCCESS,
  DELETE_CUSTOMER_CATEGORY_FAIL,
} from "./CustomerCategoryConstants";
import { AppDispatch, RootState } from "../../../../store";

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (getState: () => RootState) => {
  const token = getState().auth?.token || localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "x-api-key": apiKey,
  };
};

// Create Customer Category
export const createCustomerCategory = (data: { name: string; description?: string }) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: CREATE_CUSTOMER_CATEGORY_REQUEST });

    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID missing");

    const payload = { ...data, branchId };

    const response = await axios.post(`${baseUrl}/customer-category`, payload, {
      headers: {
        ...getAuthHeaders(getState),
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: CREATE_CUSTOMER_CATEGORY_SUCCESS,
      payload: response.data.category,
    });

    return response.data.category;
  } catch (error: any) {
    dispatch({
      type: CREATE_CUSTOMER_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Customer Categories
export const getCustomerCategories = () => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_CUSTOMER_CATEGORIES_REQUEST });

    const { data } = await axios.get(`${baseUrl}/customer-category`, {
      headers: getAuthHeaders(getState),
    });

    // Backend returns { data: categories, count, user }
    // Extract the categories array from data.data
    const categories = data.data || data.categories || data || [];

    dispatch({ type: GET_CUSTOMER_CATEGORIES_SUCCESS, payload: categories });
    return categories;
  } catch (error: any) {
    dispatch({
      type: GET_CUSTOMER_CATEGORIES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Customer Category
export const updateCustomerCategory = (categoryId: string, updateData: { name?: string; description?: string }) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: UPDATE_CUSTOMER_CATEGORY_REQUEST });

    const { data } = await axios.put(`${baseUrl}/customer-category/${categoryId}`, updateData, {
      headers: {
        ...getAuthHeaders(getState),
        "Content-Type": "application/json",
      },
    });

    dispatch({ type: UPDATE_CUSTOMER_CATEGORY_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_CUSTOMER_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Customer Category
export const deleteCustomerCategory = (categoryId: string) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_CUSTOMER_CATEGORY_REQUEST });

    await axios.delete(`${baseUrl}/customer-category/${categoryId}`, {
      headers: getAuthHeaders(getState),
    });

    dispatch({ type: DELETE_CUSTOMER_CATEGORY_SUCCESS, payload: categoryId });
    return categoryId;
  } catch (error: any) {
    dispatch({
      type: DELETE_CUSTOMER_CATEGORY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
