import axios from "axios";
import {
  CREATE_OPERATOR_REQUEST,
  CREATE_OPERATOR_SUCCESS,
  CREATE_OPERATOR_FAIL,
} from "./MachineOpertorConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

export const createOperator = (operatorData: {
  username: string;
  password: string;
  machineId: string;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_OPERATOR_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    if (!branchId) throw new Error("Branch ID missing");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = {
      ...operatorData,
      branchId,
    };

    const { data } = await axios.post("http://localhost:3000/operators", payload, config);

    dispatch({ type: CREATE_OPERATOR_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_OPERATOR_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
