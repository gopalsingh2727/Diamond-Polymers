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
} from "./machineTypeConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// Add new machine type
export const addMachineType = (type: string, description: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: ADD_MACHINE_TYPE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = { type, description: description || "N/A", branchId };

    const { data } = await axios.post("http://localhost:3000/dev/machinetype", payload, config);

    dispatch({ type: ADD_MACHINE_TYPE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: ADD_MACHINE_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get machine types (basic list)
export const getMachineTypes = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MACHINE_TYPES_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.get("http://localhost:3000/dev/machinetype", config);

    dispatch({ type: GET_MACHINE_TYPES_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: GET_MACHINE_TYPES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get all machine types with embedded machines
export const getAllMachineTypes = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: MACHINE_TYPE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.get("http://localhost:3000/dev/getAllMachineTypesWithMachines", config);
    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid data format received");
    } 
    console.log("Fetched machine types:", data);
    
    dispatch({ type: MACHINE_TYPE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: MACHINE_TYPE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
