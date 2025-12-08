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
import { cacheData, invalidateCache, isCacheValid } from "../../cache/dataCacheReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY;

// Headers helper
const getHeaders = (token?: string, isJson: boolean = false) => ({
  ...(isJson && { "Content-Type": "application/json" }),
  "x-api-key": apiKey,
  Authorization: token ? `Bearer ${token}` : "",
});

interface MachineData {
  machineName: string;
  machineType: string;
  isActive?: boolean;
}

// ✅ CREATE MACHINE
export const createMachine = (machineData: MachineData) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch({ type: CREATE_MACHINE_REQUEST });

      const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
      const branchId = localStorage.getItem("selectedBranch");

      if (!branchId) throw new Error("Branch ID not found");

      const payload = {
        machineName: machineData.machineName,
        machineType: machineData.machineType,
        branchId,
        ...(machineData.isActive !== undefined && { isActive: machineData.isActive })
      };
      console.log(payload , "payload in create machine");

      const { data } = await axios.post(`${baseUrl}/machine`, payload, {
        headers: getHeaders(token, true),
      });

      dispatch({ type: CREATE_MACHINE_SUCCESS, payload: data });

      // ✅ Invalidate machines cache so other managers see the new machine
      dispatch(invalidateCache(['machines']));
      console.log('🔄 Machine created - cache invalidated for all managers');

      return data; // ✅ Return data for component use
    } catch (error: any) {
      dispatch({
        type: CREATE_MACHINE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error; // ✅ Throw error for component handling
    }
  };

// GET MACHINE BY ID
export const getMachineById = (id: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch({ type: GET_MACHINE_REQUEST });

      const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;

      const { data } = await axios.get(`${baseUrl}/machine/${id}`, {
        headers: getHeaders(token),
      });

      dispatch({ type: GET_MACHINE_SUCCESS, payload: data.machine });
      return data.machine;
    } catch (error: any) {
      dispatch({
        type: GET_MACHINE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

// ✅ GET ALL MACHINES - With caching support
export const getMachines = () =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch({ type: GET_MACHINES_REQUEST });

      const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
      const branchId = localStorage.getItem("selectedBranch");

      if (!branchId) throw new Error("Branch ID not found");

      const { data } = await axios.get(`${baseUrl}/machine`, {
        headers: getHeaders(token),
        params: { branchId }, // ✅ Send branchId as query param
      });

      dispatch({ type: GET_MACHINES_SUCCESS, payload: data.machines });

      // ✅ Cache the machines data for 10 minutes
      dispatch(cacheData('machines', data.machines));
      console.log('💾 Machines cached successfully');

      return data.machines;
    } catch (error: any) {
      dispatch({
        type: GET_MACHINES_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

/**
 * 🚀 Smart helper: Only fetches machines if cache is missing or expired
 * Use this in components instead of getMachines() to reduce API calls
 */
export const getMachinesIfNeeded = () =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const machinesCache = state.dataCache?.machines;

    // Check if we have valid cached data
    if (isCacheValid(machinesCache)) {
      const age = Math.floor((Date.now() - new Date(machinesCache!.lastFetched).getTime()) / 1000 / 60);
      console.log(`✅ Using cached machines data (age: ${age} minutes)`);

      // Update Redux state with cached data (in case it's not there)
      dispatch({ type: GET_MACHINES_SUCCESS, payload: machinesCache!.data });

      return machinesCache!.data;
    } else {
      console.log('📊 No valid cache - fetching machines from API');
      return dispatch(getMachines());
    }
  };

// ✅ UPDATE MACHINE - Now supports tableConfig updates and invalidates cache
export const updateMachine = (id: string, updateData: Partial<MachineData>) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
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

      // ✅ Invalidate machines cache so all managers see the update
      dispatch(invalidateCache(['machines']));
      console.log('🔄 Machine updated - cache invalidated for all managers');

      return data;
    } catch (error: any) {
      dispatch({
        type: UPDATE_MACHINE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

// ✅ DELETE MACHINE - Invalidates cache
export const deleteMachine = (id: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch({ type: DELETE_MACHINE_REQUEST });

      const token = getState().auth?.token ?? localStorage.getItem("authToken") ?? undefined;
      const branchId = localStorage.getItem("selectedBranch");

      if (!branchId) throw new Error("Branch ID not found");

      await axios.delete(`${baseUrl}/machine/${id}`, {
        headers: getHeaders(token),
        params: { branchId },
      });

      dispatch({ type: DELETE_MACHINE_SUCCESS, payload: id });

      // ✅ Invalidate machines cache so all managers see the deletion
      dispatch(invalidateCache(['machines']));
      console.log('🔄 Machine deleted - cache invalidated for all managers');

      return id;
    } catch (error: any) {
      dispatch({
        type: DELETE_MACHINE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };
