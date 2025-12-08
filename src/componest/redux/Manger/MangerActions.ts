import axios from "axios";
import {
  MANAGER_CREATE_REQUEST,
  MANAGER_CREATE_SUCCESS,
  MANAGER_CREATE_FAIL,
  MANAGER_GET_ALL_REQUEST,
  MANAGER_GET_ALL_SUCCESS,
  MANAGER_GET_ALL_FAIL,
  MANAGER_UPDATE_REQUEST,
  MANAGER_UPDATE_SUCCESS,
  MANAGER_UPDATE_FAIL,
  MANAGER_DELETE_REQUEST,
  MANAGER_DELETE_SUCCESS,
  MANAGER_DELETE_FAIL,
  MANAGER_SEND_OTP_REQUEST,
  MANAGER_SEND_OTP_SUCCESS,
  MANAGER_SEND_OTP_FAIL,
  MANAGER_VERIFY_OTP_REQUEST,
  MANAGER_VERIFY_OTP_SUCCESS,
  MANAGER_VERIFY_OTP_FAIL,
  MANAGER_RESET_OTP_STATE,
} from "./MangerContants";

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

// ✅ Create Manager
export const createManager = (data: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  fullName?: string;
  branchId: string;
}) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_CREATE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.post(
      `${baseUrl}/manager/create`,
      {
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        fullName: data.fullName,
        branchId: data.branchId,
      },
      { headers: getAuthHeaders(token) }
    );

    dispatch({
      type: MANAGER_CREATE_SUCCESS,
      payload: response.data.manager || response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: MANAGER_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// ✅ Get All Managers
export const getAllManagers = () => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_GET_ALL_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const { data } = await axios.get(`${baseUrl}/manager/all`, {
      headers: getAuthHeaders(token),
    });

    dispatch({ type: MANAGER_GET_ALL_SUCCESS, payload: data.managers || data });
  } catch (error: any) {
    dispatch({
      type: MANAGER_GET_ALL_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Update Manager
export const updateManager = (
  id: string,
  updateData: {
    username?: string;
    password?: string;
    branchId?: string;
    isActive?: boolean;
  }
) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_UPDATE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const { data } = await axios.put(
      `${baseUrl}/manager/update`,
      { managerId: id, ...updateData },
      { headers: getAuthHeaders(token) }
    );

    dispatch({ type: MANAGER_UPDATE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: MANAGER_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Delete Manager
export const deleteManager = (id: string) => async (
  dispatch: any,
  getState: any
) => {
  try {
    dispatch({ type: MANAGER_DELETE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    await axios.delete(`${baseUrl}/manager/delete`, {
      headers: getAuthHeaders(token),
      data: { managerId: id },
    });

    dispatch({ type: MANAGER_DELETE_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: MANAGER_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Send OTP for Manager Email Verification (before creation)
export const sendManagerEmailOTP = (email: string) => {
  return async (dispatch: any) => {
    dispatch({ type: MANAGER_SEND_OTP_REQUEST });

    try {
      const response = await axios.post(
        `${baseUrl}/signup/send-email-otp`,
        {
          email,
          userType: 'manager',
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        }
      );

      dispatch({
        type: MANAGER_SEND_OTP_SUCCESS,
        payload: { email, message: response.data.message },
      });

      return response.data;
    } catch (error: any) {
      dispatch({
        type: MANAGER_SEND_OTP_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };
};

// ✅ Verify OTP for Manager Email (before creation)
export const verifyManagerEmailOTP = (email: string, otp: string) => {
  return async (dispatch: any) => {
    dispatch({ type: MANAGER_VERIFY_OTP_REQUEST });

    try {
      const response = await axios.post(
        `${baseUrl}/signup/verify-email-otp`,
        {
          email,
          otp,
          userType: 'manager',
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        }
      );

      dispatch({
        type: MANAGER_VERIFY_OTP_SUCCESS,
        payload: { email, emailVerified: true },
      });

      return response.data;
    } catch (error: any) {
      dispatch({
        type: MANAGER_VERIFY_OTP_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };
};

// ✅ Reset OTP state
export const resetManagerOTPState = () => ({
  type: MANAGER_RESET_OTP_STATE,
});