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

export const createMachine = (machineData: {
  machineName: string;
  machineType: string;
  size: { x: string; y: string; z: string };
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_MACHINE_REQUEST });

    const token =
      getState().auth?.token || localStorage.getItem("authToken");

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

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.post(
      "http://localhost:3000/dev/machine",
      payload,
      config
    );

    dispatch({ type: CREATE_MACHINE_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_MACHINE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};




export const getMachineById = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MACHINE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.get(`http://localhost:3000/dev/machine/${id}`, config);

    dispatch({ type: GET_MACHINE_SUCCESS, payload: data.machine });
  } catch (error: any) {
    dispatch({
      type: GET_MACHINE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};






export const getMachines = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_MACHINES_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data } = await axios.get("http://localhost:3000/dev/machine", config);
  console.log(data );
  
    dispatch({ type: GET_MACHINES_SUCCESS, payload: data.machines });
  } catch (error: any) {
    dispatch({
      type: GET_MACHINES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};





export const updateMachine = (id: string, data: any) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: UPDATE_MACHINE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const { data: updated } = await axios.put(`http://localhost:3000/dev/machine/${id}`, data, config);

    dispatch({ type: UPDATE_MACHINE_SUCCESS, payload: updated });
  } catch (error: any) {
    dispatch({
      type: UPDATE_MACHINE_FAIL,
      payload: error?.response?.data?.message || error.message,
    });
  }
};

export const deleteMachine = (id: string) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: DELETE_MACHINE_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) throw new Error("Branch ID not found");

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    await axios.delete(`http://localhost:3000/dev/machine/${id}`, config);

    dispatch({ type: DELETE_MACHINE_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({
      type: DELETE_MACHINE_FAIL,
      payload: error?.response?.data?.message || error.message,
    });
  }
};
