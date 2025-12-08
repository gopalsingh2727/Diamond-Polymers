import axios from "axios";
import {
  DEVICE_ACCESS_CREATE_REQUEST,
  DEVICE_ACCESS_CREATE_SUCCESS,
  DEVICE_ACCESS_CREATE_FAIL,
  DEVICE_ACCESS_LIST_REQUEST,
  DEVICE_ACCESS_LIST_SUCCESS,
  DEVICE_ACCESS_LIST_FAIL,
  DEVICE_ACCESS_UPDATE_REQUEST,
  DEVICE_ACCESS_UPDATE_SUCCESS,
  DEVICE_ACCESS_UPDATE_FAIL,
  DEVICE_ACCESS_DELETE_REQUEST,
  DEVICE_ACCESS_DELETE_SUCCESS,
  DEVICE_ACCESS_DELETE_FAIL,
} from "./deviceAccessConstants";
import { AppDispatch, RootState } from "../../../store";
import { refreshOrderFormData } from "../oders/orderFormDataActions";

const getToken = (getState: () => RootState): string | null => {
  return getState().auth?.token || localStorage.getItem("authToken");
};

const getHeaders = (token: string | null) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    "x-api-key": apiKey,
  };
};

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;

export const resetDeviceAccessState = () => ({
  type: 'deviceAccess/reset'
});



export const createDeviceAccess = (data: {
  deviceName: string;
  location: string;
  password: string;
  confirmPassword: string;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: DEVICE_ACCESS_CREATE_REQUEST });

      const token = getToken(getState);
      console.log(token);

      // Basic validations
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const payload = {
        deviceName: data.deviceName.trim(),
        location: data.location.trim(),
        password: data.password,
      };

      const response = await axios.post(
        `${baseUrl}/device-access`,
        payload,
        { headers: getHeaders(token) }
      );

      // Store the plain password temporarily for display
      const deviceData = {
        ...response.data,
        plainPassword: data.password, // Add plain password for display
      };

      dispatch({
        type: DEVICE_ACCESS_CREATE_SUCCESS,
        payload: deviceData,
      });

      // Refresh cached form data so the new device appears in lists
      dispatch(refreshOrderFormData());

      return deviceData; // Return data for component use
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Device access creation failed";
      
      dispatch({
        type: DEVICE_ACCESS_CREATE_FAIL,
        payload: errorMessage,
      });

      throw error; // Re-throw to handle in component
    }
  };
};

export const getDeviceAccessList = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: DEVICE_ACCESS_LIST_REQUEST });
      const token = getToken(getState);

      const response = await axios.get(
        `${baseUrl}/device-access`,
        { headers: getHeaders(token) }
      );

      dispatch({
        type: DEVICE_ACCESS_LIST_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: DEVICE_ACCESS_LIST_FAIL,
        payload:
          error.response?.data?.message || error.message || "Failed to fetch device access list",
      });
    }
  };
};

export const updateDeviceAccess = (
  id: string,
  action: "updateDetails" | "assignMachine" | "removeMachine",
  data: {
    deviceName?: string;
    location?: string;
    password?: string;
    confirmPassword?: string;
    pin?: string;
    confirmPin?: string;
    machineId?: string;
    machineName?: string;
    machineType?: string;
  }
) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: DEVICE_ACCESS_UPDATE_REQUEST });

      const token = getToken(getState);

      // Handle validation only when updating details
      if (action === "updateDetails") {
        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (data.pin && data.confirmPin && data.pin !== data.confirmPin) {
          throw new Error("PINs do not match");
        }
      }

      // Build payload
      let payload: any = { action };

      if (action === "updateDetails") {
        if (data.deviceName !== undefined) payload.deviceName = data.deviceName.trim();
        if (data.location !== undefined) payload.location = data.location.trim();
        if (data.password !== undefined) payload.password = data.password;
        if (data.pin !== undefined) payload.pin = data.pin;
      } else if (action === "assignMachine") {
        payload.machineId = data.machineId;
        payload.machineName = data.machineName;
        payload.machineType = data.machineType;
      } else if (action === "removeMachine") {
        payload.machineId = data.machineId;
      }
      console.log(data);
      
      const response = await axios.put(
        `${baseUrl}/device-access/${id}`,
        payload,
        { headers: getHeaders(token) }
      );

      dispatch({
        type: DEVICE_ACCESS_UPDATE_SUCCESS,
        payload: response.data,
      });

      // Refresh cached form data so the updated device appears in lists
      dispatch(refreshOrderFormData());

    } catch (error: any) {
      dispatch({
        type: DEVICE_ACCESS_UPDATE_FAIL,
        payload:
          error.response?.data?.message || error.message || "Device access update failed",
      });
    }
  };
};

export const deleteDeviceAccess = (id: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: DEVICE_ACCESS_DELETE_REQUEST });

      const token = getToken(getState);

      await axios.delete(
        `${baseUrl}/device-access/${id}`,
        { headers: getHeaders(token) }
      );

      dispatch({
        type: DEVICE_ACCESS_DELETE_SUCCESS,
        payload: id,
      });

      // Refresh cached form data so the deleted device is removed from lists
      dispatch(refreshOrderFormData());

    } catch (error: any) {
      dispatch({
        type: DEVICE_ACCESS_DELETE_FAIL,
        payload:
          error.response?.data?.message || error.message || "Device access deletion failed",
      });
    }
  };
};