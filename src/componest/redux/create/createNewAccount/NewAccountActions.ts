import axios from 'axios';
import {
  CREATE_ACCOUNT_REQUEST,
  CREATE_ACCOUNT_SUCCESS,
  CREATE_ACCOUNT_FAIL,
} from './NewAccountConstants';

export const createAccount = (data: any) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: CREATE_ACCOUNT_REQUEST });

    const token = getState().auth?.token || localStorage.getItem("authToken");
     console.log(token);
     
    const branchId = localStorage.getItem("selectedBranch");
    data.append("branchId", branchId);
    console.log(branchId , "tjhos");
    
    if (!branchId) throw new Error("Branch ID missing");

    data.branchId = branchId;

    const response = await axios.post("http://localhost:3000/dev/customer", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: CREATE_ACCOUNT_SUCCESS,
      payload: response.data.customer,
    });
  } catch (error: any) {
    dispatch({
      type: CREATE_ACCOUNT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};