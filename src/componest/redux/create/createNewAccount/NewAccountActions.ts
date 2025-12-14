import axios from "axios";
import {
  CREATE_ACCOUNT_REQUEST,
  CREATE_ACCOUNT_SUCCESS,
  CREATE_ACCOUNT_FAIL,
  GET_ACCOUNTS_REQUEST,
  GET_ACCOUNTS_SUCCESS,
  GET_ACCOUNTS_FAIL,
  UPDATE_ACCOUNT_REQUEST,
  UPDATE_ACCOUNT_SUCCESS,
  UPDATE_ACCOUNT_FAIL,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
} from "./NewAccountConstants";
import { AppDispatch, RootState } from "../../../../store";
import { refreshOrderFormData } from "../../oders/orderFormDataActions";

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (getState: () => RootState) => {
  const token = getState().auth?.token || localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "x-api-key": apiKey,
  };
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const createAccount = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_ACCOUNT_REQUEST });

    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID missing");

    const headers: any = {
      ...getAuthHeaders(getState),
      "Content-Type": "application/json",
    };

    // Always convert to JSON - more reliable than multipart
    const jsonData: Record<string, any> = {};

    if (data instanceof FormData) {
      // Check if FormData contains an actual image file
      const imageFile = data.get("image");
      const hasImage = imageFile instanceof File && imageFile.size > 0;

      // Extract all form fields
      data.forEach((value, key) => {
        if (key !== "image" && typeof value === 'string') {
          jsonData[key] = value;
        }
      });

      // Convert image to base64 if present
      if (hasImage && imageFile instanceof File) {
        try {
          const base64 = await fileToBase64(imageFile);
          jsonData.imageBase64 = base64;
          jsonData.imageName = imageFile.name;
          console.log("Sending with base64 image:", imageFile.name);
        } catch (err) {
          console.error("Failed to convert image to base64:", err);
        }
      }
    } else {
      // Already JSON object
      Object.assign(jsonData, data);
    }

    jsonData.branchId = branchId;
    console.log("Sending as JSON:", Object.keys(jsonData));

    const response = await axios.post(`${baseUrl}/customer`, jsonData, { headers });
    console.log("Account created successfully:", response.data);
    dispatch({
      type: CREATE_ACCOUNT_SUCCESS,
      payload: response.data.customer,
    });

    // Refresh cached form data so the new customer appears in lists
    dispatch(refreshOrderFormData());
  } catch (error: any) {
    dispatch({
      type: CREATE_ACCOUNT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};














export const getAccounts = () => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_ACCOUNTS_REQUEST });

    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const { data } = await axios.get(`${baseUrl}/customer`, {
      headers: getAuthHeaders(getState),
    });

    // Backend returns { data: customers, count, user } - extract array
    const accounts = data.data || data.customers || data || [];

    dispatch({ type: GET_ACCOUNTS_SUCCESS, payload: accounts });
  } catch (error: any) {
    dispatch({
      type: GET_ACCOUNTS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Update Account
export const updateAccount = (accountId: string, updateData: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_ACCOUNT_REQUEST });

    const { data } = await axios.put(`${baseUrl}/customer/${accountId}`, updateData, {
      headers: {
        ...getAuthHeaders(getState),
        "Content-Type": "application/json",
      },
    });

    dispatch({ type: UPDATE_ACCOUNT_SUCCESS, payload: data });

    // Refresh cached form data so the updated customer appears in lists
    dispatch(refreshOrderFormData());
  } catch (error: any) {
    dispatch({
      type: UPDATE_ACCOUNT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Account
export const deleteAccount = (accountId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_ACCOUNT_REQUEST });

    await axios.delete(`${baseUrl}/customer/${accountId}`, {
      headers: getAuthHeaders(getState),
    });

    dispatch({ type: DELETE_ACCOUNT_SUCCESS, payload: accountId });

    // Refresh cached form data so the deleted customer is removed from lists
    dispatch(refreshOrderFormData());
  } catch (error: any) {
    dispatch({
      type: DELETE_ACCOUNT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};