import axios from "axios";
import {
  CREATE_MACHINE_REQUEST,
  CREATE_MACHINE_SUCCESS,
  CREATE_MACHINE_FAIL,
  GET_MACHINE_REQUEST,
  GET_MACHINE_SUCCESS,
  GET_MACHINE_FAIL,
  GET_MACHINES_REQUEST,
  GET_MACHINES_SUCCESS,
  GET_MACHINES_FAIL,
  UPDATE_MACHINE_REQUEST,
  UPDATE_MACHINE_SUCCESS,
  UPDATE_MACHINE_FAIL,
  DELETE_MACHINE_REQUEST,
  DELETE_MACHINE_SUCCESS,
  DELETE_MACHINE_FAIL,
} from "./MachineContants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY;

// Headers helper
const getHeaders = (token?: string, isJson: boolean = false) => ({
  ...(isJson && { "Content-Type": "application/json" }),
  "x-api-key": apiKey,
  Authorization: token ? `Bearer ${token}` : "",
});

// CREATE MACHINE
export const createMachine = (machineData: {
  machineName: string;
  machineType: string;
  size: { x: string; y: string; z: string };
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_MACHINE_REQUEST });

    const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const payload = {
      machineName: machineData.machineName,
      machineType: machineData.machineType,
      sizeX: machineData.size.x,
      sizeY: machineData.size.y,
      sizeZ: machineData.size.z,
      branchId,
    };

    const { data } = await axios.post(`${baseUrl}/machine`, payload, {
      headers: getHeaders(token, true),
    });

    dispatch({ type: CREATE_MACHINE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_MACHINE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// GET MACHINE BY ID
export const getMachineById = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_MACHINE_REQUEST });

    const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;

    const { data } = await axios.get(`${baseUrl}/machine/${id}`, {
      headers: getHeaders(token),
    });

    dispatch({ type: GET_MACHINE_SUCCESS, payload: data.machine });
  } catch (error: any) {
    dispatch({
      type: GET_MACHINE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// GET ALL MACHINES
export const getMachines = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_MACHINES_REQUEST });

    const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const { data } = await axios.get(`${baseUrl}/machine`, {
      headers: getHeaders(token),
      // params: { branchId }, // ✅ Fixed: Pass branchId
    });
    
    
    dispatch({ type: GET_MACHINES_SUCCESS, payload: data.machines });
  } catch (error: any) {
    dispatch({
      type: GET_MACHINES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// UPDATE MACHINE
export const updateMachine = (id: string, updateData: any) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_MACHINE_REQUEST });

    const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    const payload = {
      ...updateData,
      branchId,
    };

    const { data } = await axios.put(`${baseUrl}/machine/${id}`, payload, {
      headers: getHeaders(token, true),
    });

    dispatch({ type: UPDATE_MACHINE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: UPDATE_MACHINE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// DELETE MACHINE
export const deleteMachine = (id: string) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_MACHINE_REQUEST });

    const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
    const branchId = localStorage.getItem("selectedBranch");
    if (!branchId) throw new Error("Branch ID not found");

    await axios.delete(`${baseUrl}/dev/machine/${id}`, {
      headers: getHeaders(token),
      params: { branchId }, // ✅ Ensure branch context is passed if required
    });

    dispatch({ type: DELETE_MACHINE_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_MACHINE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};