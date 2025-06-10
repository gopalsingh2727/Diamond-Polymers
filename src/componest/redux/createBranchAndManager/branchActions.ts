import axios from "axios";
import {
  BRANCH_CREATE_REQUEST,
  BRANCH_CREATE_SUCCESS,
  BRANCH_CREATE_FAIL,
} from "./branchConstants";

export const createBranch = (data: any) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: BRANCH_CREATE_REQUEST });

    const state = getState();
    const token = state.auth?.token || localStorage.getItem("authToken");

    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
      throw new Error("Branch name is required and must be a string.");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
      name: data.name.trim(),
      location: data.location?.trim() || "",
    };

    const response = await axios.post(
      `http://localhost:3000/dev/branch/create`,
      payload,
      config
    );

    dispatch({
      type: BRANCH_CREATE_SUCCESS,
      payload: response.data,
    });
  } catch (error: any) {
    dispatch({
      type: BRANCH_CREATE_FAIL,
      payload:
        error.response?.data?.message || error.message || "Branch creation failed",
    });
  }
};