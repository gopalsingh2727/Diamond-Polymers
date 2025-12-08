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

export const createAccount = (data: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_ACCOUNT_REQUEST });

    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID missing");

    let headers: any = {
      ...getAuthHeaders(getState),
      "Content-Type": "application/json",
    };

    let payload = data;


    if (data instanceof FormData) {
      data.append("branchId", branchId);
      payload = data;
      headers["Content-Type"] = "multipart/form-data";
    } else {
      payload = { ...data, branchId };
    }

    // Debug log to inspect payload
    if (payload instanceof FormData) {
      for (let pair of payload.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await axios.post(`${baseUrl}/customer`, payload, { headers });
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
    console.log(data,"customer");
    

    dispatch({ type: GET_ACCOUNTS_SUCCESS, payload: data });
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