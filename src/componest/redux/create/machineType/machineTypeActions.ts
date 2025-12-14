import axios from "axios";
import {
  ADD_MACHINE_TYPE_REQUEST,
  ADD_MACHINE_TYPE_SUCCESS,
  ADD_MACHINE_TYPE_FAIL,
  GET_MACHINE_TYPES_REQUEST,
  GET_MACHINE_TYPES_SUCCESS,
  GET_MACHINE_TYPES_FAIL,
  MACHINE_TYPE_REQUEST,
  MACHINE_TYPE_SUCCESS,
  MACHINE_TYPE_FAIL,
  UPDATE_MACHINE_TYPE_REQUEST,
  UPDATE_MACHINE_TYPE_SUCCESS,
  UPDATE_MACHINE_TYPE_FAIL,
  DELETE_MACHINE_TYPE_REQUEST,
  DELETE_MACHINE_TYPE_SUCCESS,
  DELETE_MACHINE_TYPE_FAIL



} from "./machineTypeConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";
import { refreshOrderFormData } from "../../oders/orderFormDataActions";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

// Fixed: Get branch ID dynamically inside the function
const getBranchId = (getState: () => RootState): string | null => {
  // First try to get from Redux state
  const selectedBranch = getState().auth?.userData?.selectedBranch;
  if (selectedBranch) return selectedBranch;
  
  // Fallback to localStorage
  return localStorage.getItem("selectedBranch");
};

// Alternative: Get from userData in localStorage
const getBranchIdFromUserData = (): string | null => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.selectedBranch || null;
    }
  } catch (error) {
    console.error("Error parsing userData from localStorage:", error);
  }
  return null;
};

// Headers builder
const getHeaders = (
  token?: string | null,
  extra?: Record<string, string>
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(extra || {}),
});

export const addMachineType = (
  type: string,
  description: string,
  isActive: boolean = true
) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ADD_MACHINE_TYPE_REQUEST });

    const token = getToken(getState);

    // Fixed: Get branch ID dynamically
    let branchId = getBranchId(getState);
     console.log(branchId , " branchid");

    // If not found in Redux state, try userData from localStorage
    if (!branchId) {
      branchId = getBranchIdFromUserData();
    }

    console.log("Branch ID:", branchId);

    if (!branchId) {
      throw new Error("Branch ID not found. Please select a branch first.");
    }

    const payload = {
      type,
      description,
      branchId,
      isActive,
    };

    const { data } = await axios.post(
      `${baseUrl}/createMachineType/machinetype`,
      payload,
      { headers: getHeaders(token) }
    );

    dispatch({ type: ADD_MACHINE_TYPE_SUCCESS, payload: data });

    // Refresh cached form data so the new machine type appears in lists
    dispatch(refreshOrderFormData() as any);

  } catch (error: any) {
    dispatch({
      type: ADD_MACHINE_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};


export const getMachineTypes = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MACHINE_TYPES_REQUEST });

    const token = getToken(getState);
    let branchId = getBranchId(getState);
     console.log(branchId , " branchid");
  

    const { data } = await axios.get(`${baseUrl}/machinetype`, {
      headers: getHeaders(token) ,  params: { branchId },
    });

    // Backend may return array directly or { data: [...] }
    const machineTypes = Array.isArray(data) ? data : (data.data || data.machineTypes || []);

    dispatch({ type: GET_MACHINE_TYPES_SUCCESS, payload: machineTypes });
  } catch (error: any) {
    dispatch({
      type: GET_MACHINE_TYPES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// GET All Machine Types with Machines
export const getAllMachineTypes = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: MACHINE_TYPE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/getAllMachineTypesWithMachines`,
      { headers: getHeaders(token) }
    );
 
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received");
    }

    dispatch({ type: MACHINE_TYPE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: MACHINE_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};



export const updateMachineType = (
  machineTypeId: string,
  type: string,
  description: string,
  isActive: boolean = true
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_MACHINE_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const payload = {
      type,
      description,
      branchId,
      isActive,
    };

    const { data } = await axios.put(
      `${baseUrl}/machinetype/${machineTypeId}`,
      payload,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_MACHINE_TYPE_SUCCESS, payload: data });

    // Refresh cached form data so the updated machine type appears in lists
    dispatch(refreshOrderFormData() as any);

    return data; // Return data for handling in component
  } catch (error: any) {
    dispatch({
      type: UPDATE_MACHINE_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};




export const deleteMachineType = (machineTypeId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_MACHINE_TYPE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    await axios.delete(
      `${baseUrl}/machinetype/${machineTypeId}`,
      {
        headers: getHeaders(token),
        data: { branchId } 
      }
    );

    dispatch({ type: DELETE_MACHINE_TYPE_SUCCESS, payload: machineTypeId });

    // Refresh cached form data so the deleted machine type is removed from lists
    dispatch(refreshOrderFormData() as any);

  } catch (error: any) {
    dispatch({
      type: DELETE_MACHINE_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};




