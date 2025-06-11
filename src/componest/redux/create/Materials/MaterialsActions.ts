import axios from "axios";
import {
  CREATE_MATERIAL_REQUEST,
  CREATE_MATERIAL_SUCCESS,
  CREATE_MATERIAL_FAIL,
} from "./MaterialContants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

export const createMaterial = (materialData: {
  materialName: string;
  materialMol: number;
  materialType: string;
}) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_MATERIAL_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
    const branchId = localStorage.getItem("selectedBranch");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    const payload = { ...materialData, branchId };

    const { data } = await axios.post(
      "http://localhost:3000/dev/material",
      payload,
      config
    );

    dispatch({ type: CREATE_MATERIAL_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: CREATE_MATERIAL_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};