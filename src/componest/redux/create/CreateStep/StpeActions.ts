import axios from "axios";
import {
  CREATE_STEP_REQUEST,
  CREATE_STEP_SUCCESS,
  CREATE_STEP_FAIL,
  GET_STEPS_REQUEST,
  GET_STEPS_SUCCESS,
  GET_STEPS_FAIL,
  UPDATE_STEP_REQUEST,
  UPDATE_STEP_SUCCESS,
  UPDATE_STEP_FAIL,
  DELETE_STEP_REQUEST,
  DELETE_STEP_SUCCESS,
  DELETE_STEP_FAIL,
} from "./StpeContants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";


const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getToken = (getState: () => RootState): string | null => {
  return getState().auth?.token || localStorage.getItem("authToken");
};

const getBranchId = () => localStorage.getItem("selectedBranch");

// ✅ CREATE STEP
export const createStep = (stepData: any) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: CREATE_STEP_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID is missing");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "x-api-key": API_KEY,
      },
    };

    const payload = {
      stepName: stepData.stepName,
      machines: stepData.machines,
      branchId,
    };

    const { data } = await axios.post(`${baseUrl}/step`, payload, config);

    dispatch({ type: CREATE_STEP_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_STEP_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ GET STEPS
export const getSteps = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_STEPS_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID is missing");

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "x-api-key": API_KEY,
      },
      params: { branchId },
    };
    
    const { data } = await axios.get(`${baseUrl}/step`, config);

    // Backend may return { data: steps } or array directly
    const steps = Array.isArray(data) ? data : (data.data || data.steps || []);

    dispatch({ type: GET_STEPS_SUCCESS, payload: steps });
  } catch (error: any) {
    dispatch({
      type: GET_STEPS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ UPDATE STEP
export const updateStep = (stepId: string, stepData: any) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: UPDATE_STEP_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID is missing");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "x-api-key": API_KEY,
      },
    };

    const payload = {
      stepName: stepData.stepName,
      machines: stepData.machines,
      branchId,
    };

    const { data } = await axios.put(
      `${baseUrl}/step/${stepId}`,
      payload,
      config
    );

    dispatch({ type: UPDATE_STEP_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_STEP_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ✅ DELETE STEP
export const deleteStep = (stepId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_STEP_REQUEST });

    const token = getToken(getState);
    if (!stepId) throw new Error("Step ID is required");

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "x-api-key": API_KEY,
      },
    };

    await axios.delete(`${baseUrl}/step/${stepId}`, config);

    dispatch({ type: DELETE_STEP_SUCCESS, payload: stepId });
  } catch (error: any) {
    dispatch({
      type: DELETE_STEP_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};