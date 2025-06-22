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
  password: string;
  branchId: string;
}) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_CREATE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.post(
      `${baseUrl}/dev/manager/create`,
      data,
      { headers: getAuthHeaders(token) }
    );

    dispatch({
      type: MANAGER_CREATE_SUCCESS,
      payload: response.data.manager || response.data,
    });
  } catch (error: any) {
    dispatch({
      type: MANAGER_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ Get All Managers
export const getAllManagers = () => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_GET_ALL_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const { data } = await axios.get(`${baseUrl}/dev/manager`, {
      headers: getAuthHeaders(token),
    });

    dispatch({ type: MANAGER_GET_ALL_SUCCESS, payload: data });
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
  }
) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: MANAGER_UPDATE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    const { data } = await axios.put(
      `${baseUrl}/dev/manager/${id}`,
      updateData,
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

    await axios.delete(`${baseUrl}/dev/manager/${id}`, {
      headers: getAuthHeaders(token),
    });

    dispatch({ type: MANAGER_DELETE_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: MANAGER_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};