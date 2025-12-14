import axios from "axios";
import {
  CREATE_CUSTOMER_PARENT_COMPANY_REQUEST,
  CREATE_CUSTOMER_PARENT_COMPANY_SUCCESS,
  CREATE_CUSTOMER_PARENT_COMPANY_FAIL,
  GET_CUSTOMER_PARENT_COMPANIES_REQUEST,
  GET_CUSTOMER_PARENT_COMPANIES_SUCCESS,
  GET_CUSTOMER_PARENT_COMPANIES_FAIL,
  UPDATE_CUSTOMER_PARENT_COMPANY_REQUEST,
  UPDATE_CUSTOMER_PARENT_COMPANY_SUCCESS,
  UPDATE_CUSTOMER_PARENT_COMPANY_FAIL,
  DELETE_CUSTOMER_PARENT_COMPANY_REQUEST,
  DELETE_CUSTOMER_PARENT_COMPANY_SUCCESS,
  DELETE_CUSTOMER_PARENT_COMPANY_FAIL,
} from "./CustomerParentCompanyConstants";
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

// Create Customer Parent Company
export const createCustomerParentCompany = (data: { name: string; description?: string }) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: CREATE_CUSTOMER_PARENT_COMPANY_REQUEST });

    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID missing");

    const payload = { ...data, branchId };

    const response = await axios.post(`${baseUrl}/customer-parent-company`, payload, {
      headers: {
        ...getAuthHeaders(getState),
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: CREATE_CUSTOMER_PARENT_COMPANY_SUCCESS,
      payload: response.data.parentCompany,
    });

    return response.data.parentCompany;
  } catch (error: any) {
    dispatch({
      type: CREATE_CUSTOMER_PARENT_COMPANY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Customer Parent Companies
export const getCustomerParentCompanies = () => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_CUSTOMER_PARENT_COMPANIES_REQUEST });

    const { data } = await axios.get(`${baseUrl}/customer-parent-company`, {
      headers: getAuthHeaders(getState),
    });

    // Backend returns { data: parentCompanies, count, user }
    // Extract the parentCompanies array from data.data
    const parentCompanies = data.data || data.parentCompanies || data || [];

    dispatch({ type: GET_CUSTOMER_PARENT_COMPANIES_SUCCESS, payload: parentCompanies });
    return parentCompanies;
  } catch (error: any) {
    dispatch({
      type: GET_CUSTOMER_PARENT_COMPANIES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Update Customer Parent Company
export const updateCustomerParentCompany = (companyId: string, updateData: { name?: string; description?: string }) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: UPDATE_CUSTOMER_PARENT_COMPANY_REQUEST });

    const { data } = await axios.put(`${baseUrl}/customer-parent-company/${companyId}`, updateData, {
      headers: {
        ...getAuthHeaders(getState),
        "Content-Type": "application/json",
      },
    });

    dispatch({ type: UPDATE_CUSTOMER_PARENT_COMPANY_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_CUSTOMER_PARENT_COMPANY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Delete Customer Parent Company
export const deleteCustomerParentCompany = (companyId: string) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_CUSTOMER_PARENT_COMPANY_REQUEST });

    await axios.delete(`${baseUrl}/customer-parent-company/${companyId}`, {
      headers: getAuthHeaders(getState),
    });

    dispatch({ type: DELETE_CUSTOMER_PARENT_COMPANY_SUCCESS, payload: companyId });
    return companyId;
  } catch (error: any) {
    dispatch({
      type: DELETE_CUSTOMER_PARENT_COMPANY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
