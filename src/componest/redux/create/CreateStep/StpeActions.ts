import axios from "axios";
import {
  CREATE_STEP_REQUEST,
  CREATE_STEP_SUCCESS,
  CREATE_STEP_FAIL,
} from "./StpeContants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

export const createStep = (stepData: any) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: CREATE_STEP_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) throw new Error("Branch ID is missing");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = {
      stepName: stepData.stepName,
      machines: stepData.machines,
      branchId,
    };

    const { data } = await axios.post(
      "http://localhost:3000/dev/step",
      payload,
      config
    );

    dispatch({ type: CREATE_STEP_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_STEP_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
