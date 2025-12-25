import axios from "axios";
import {
  CREATE_OPERATOR_REQUEST,
  CREATE_OPERATOR_SUCCESS,
  CREATE_OPERATOR_FAIL,
  FETCH_OPERATORS_REQUEST,
  FETCH_OPERATORS_SUCCESS,
  FETCH_OPERATORS_FAIL,
  UPDATE_OPERATOR_REQUEST,
  UPDATE_OPERATOR_SUCCESS,
  UPDATE_OPERATOR_FAIL,
  DELETE_OPERATOR_REQUEST,
  DELETE_OPERATOR_SUCCESS,
  DELETE_OPERATOR_FAIL,
} from "./MachineOpertorConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";
import { refreshOrderFormData } from "../../oders/orderFormDataActions";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Helpers
const getToken = (getState: () => RootState) =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = () => localStorage.getItem("selectedBranch");

// Headers helper
const getHeaders = (token?: string | null) => {
  const selectedBranch = localStorage.getItem("selectedBranch");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    "x-api-key": API_KEY,
  };
  if (selectedBranch) {
    headers["x-selected-branch"] = selectedBranch;
  }
  return headers;
};

// Create Operator
export const createOperator = (operatorData: {
  username: string;
  pin: string;
  machineId: string;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_OPERATOR_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID missing");

    // Validate PIN format
    if (!/^\d{4}$/.test(operatorData.pin)) {
      throw new Error("PIN must be exactly 4 digits");
    }

    const payload = { ...operatorData, branchId };

    const { data } = await axios.post(`${baseUrl}/operators`, payload, {
      headers: getHeaders(token),
    });

    dispatch({ type: CREATE_OPERATOR_SUCCESS, payload: data });

    // Refresh cached form data so the new operator appears in lists
    dispatch(refreshOrderFormData() as any);

  } catch (error: any) {
    dispatch({
      type: CREATE_OPERATOR_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get All Operators
export const listOperators = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: FETCH_OPERATORS_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId();
    if (!branchId) throw new Error("Branch ID missing");

    const { data } = await axios.get(`${baseUrl}/operator`, {
      headers: getHeaders(token),
    });
    console.log(data, "this update of");
    

    dispatch({ type: FETCH_OPERATORS_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: FETCH_OPERATORS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update Operator
export const updateOperator = (operatorId: string, updates: any) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: UPDATE_OPERATOR_REQUEST });

    const token = getToken(getState);

    // Validate PIN format if PIN is being updated
    if (updates.pin && !/^\d{4}$/.test(updates.pin)) {
      throw new Error("PIN must be exactly 4 digits");
    }

    const { data } = await axios.put(`${baseUrl}/operator/${operatorId}`, updates, {
      headers: getHeaders(token),
    });

    dispatch({ type: UPDATE_OPERATOR_SUCCESS, payload: data });

    // Refresh cached form data so the updated operator appears in lists
    dispatch(refreshOrderFormData() as any);

  } catch (error: any) {
    dispatch({
      type: UPDATE_OPERATOR_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete Operator
export const deleteOperator = (operatorId: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_OPERATOR_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(`${baseUrl}/operator/${operatorId}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: DELETE_OPERATOR_SUCCESS, payload: data });

    // Refresh cached form data so the deleted operator is removed from lists
    dispatch(refreshOrderFormData() as any);

  } catch (error: any) {
    dispatch({
      type: DELETE_OPERATOR_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};