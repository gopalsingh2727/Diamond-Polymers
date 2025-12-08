import axios from 'axios';

export const CREATE_ADMIN_REQUEST = 'CREATE_ADMIN_REQUEST';
export const CREATE_ADMIN_SUCCESS = 'CREATE_ADMIN_SUCCESS';
export const CREATE_ADMIN_FAIL = 'CREATE_ADMIN_FAIL';

export const ADMIN_LIST_REQUEST = 'ADMIN_LIST_REQUEST';
export const ADMIN_LIST_SUCCESS = 'ADMIN_LIST_SUCCESS';
export const ADMIN_LIST_FAIL = 'ADMIN_LIST_FAIL';

export const ADMIN_UPDATE_REQUEST = 'ADMIN_UPDATE_REQUEST';
export const ADMIN_UPDATE_SUCCESS = 'ADMIN_UPDATE_SUCCESS';
export const ADMIN_UPDATE_FAIL = 'ADMIN_UPDATE_FAIL';

export const ADMIN_DELETE_REQUEST = 'ADMIN_DELETE_REQUEST';
export const ADMIN_DELETE_SUCCESS = 'ADMIN_DELETE_SUCCESS';
export const ADMIN_DELETE_FAIL = 'ADMIN_DELETE_FAIL';

// OTP Verification Actions
export const ADMIN_SEND_OTP_REQUEST = 'ADMIN_SEND_OTP_REQUEST';
export const ADMIN_SEND_OTP_SUCCESS = 'ADMIN_SEND_OTP_SUCCESS';
export const ADMIN_SEND_OTP_FAIL = 'ADMIN_SEND_OTP_FAIL';

export const ADMIN_VERIFY_OTP_REQUEST = 'ADMIN_VERIFY_OTP_REQUEST';
export const ADMIN_VERIFY_OTP_SUCCESS = 'ADMIN_VERIFY_OTP_SUCCESS';
export const ADMIN_VERIFY_OTP_FAIL = 'ADMIN_VERIFY_OTP_FAIL';

export const ADMIN_RESET_OTP_STATE = 'ADMIN_RESET_OTP_STATE';

interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  fullName?: string;
  branchIds: string[];
  product27InfinityId: string;
}

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

// Create Admin
export const createAdmin = (adminData: CreateAdminData) => {
  return async (dispatch: any, getState: any) => {
    dispatch({ type: CREATE_ADMIN_REQUEST });

    try {
      const token = getState().auth?.token || localStorage.getItem("authToken");

      const response = await axios.post(
        `${baseUrl}/admin/create`,
        {
          username: adminData.username,
          email: adminData.email,
          password: adminData.password,
          phone: adminData.phone,
          fullName: adminData.fullName,
          branchIds: adminData.branchIds,
          product27InfinityId: adminData.product27InfinityId,
        },
        {
          headers: getAuthHeaders(token),
        }
      );

      dispatch({
        type: CREATE_ADMIN_SUCCESS,
        payload: response.data,
      });

      return response.data;
    } catch (error: any) {
      dispatch({
        type: CREATE_ADMIN_FAIL,
        payload: error.response?.data?.message || error.message,
      });

      throw error;
    }
  };
};

// Get All Admins
export const getAllAdmins = () => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: ADMIN_LIST_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const { data } = await axios.get(`${baseUrl}/admin/all`, {
      headers: getAuthHeaders(token),
    });

    dispatch({ type: ADMIN_LIST_SUCCESS, payload: data.admins || data });
  } catch (error: any) {
    dispatch({
      type: ADMIN_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update Admin
export const updateAdmin = (
  id: string,
  updateData: {
    username?: string;
    password?: string;
    isActive?: boolean;
    branchIds?: string[];
  }
) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: ADMIN_UPDATE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const { data } = await axios.put(
      `${baseUrl}/admin/update`,
      { adminId: id, ...updateData },
      { headers: getAuthHeaders(token) }
    );

    dispatch({ type: ADMIN_UPDATE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: ADMIN_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete Admin
export const deleteAdmin = (id: string) => async (
  dispatch: any,
  getState: any
) => {
  try {
    dispatch({ type: ADMIN_DELETE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    await axios.delete(`${baseUrl}/admin/delete`, {
      headers: getAuthHeaders(token),
      data: { adminId: id },
    });

    dispatch({ type: ADMIN_DELETE_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: ADMIN_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Send OTP for Admin Email Verification (before creation)
export const sendAdminEmailOTP = (email: string) => {
  return async (dispatch: any) => {
    dispatch({ type: ADMIN_SEND_OTP_REQUEST });

    try {
      const response = await axios.post(
        `${baseUrl}/signup/send-email-otp`,
        {
          email,
          userType: 'admin',
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        }
      );

      dispatch({
        type: ADMIN_SEND_OTP_SUCCESS,
        payload: { email, message: response.data.message },
      });

      return response.data;
    } catch (error: any) {
      dispatch({
        type: ADMIN_SEND_OTP_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };
};

// Verify OTP for Admin Email (before creation)
export const verifyAdminEmailOTP = (email: string, otp: string) => {
  return async (dispatch: any) => {
    dispatch({ type: ADMIN_VERIFY_OTP_REQUEST });

    try {
      const response = await axios.post(
        `${baseUrl}/signup/verify-email-otp`,
        {
          email,
          otp,
          userType: 'admin',
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        }
      );

      dispatch({
        type: ADMIN_VERIFY_OTP_SUCCESS,
        payload: { email, emailVerified: true },
      });

      return response.data;
    } catch (error: any) {
      dispatch({
        type: ADMIN_VERIFY_OTP_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };
};

// Reset OTP state
export const resetAdminOTPState = () => ({
  type: ADMIN_RESET_OTP_STATE,
});
