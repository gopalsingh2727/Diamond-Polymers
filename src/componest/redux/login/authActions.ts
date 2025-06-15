import axios from "axios";
import {
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from "./authConstants";







export const login = (username: string, password: string) => {
  return async (dispatch: any) => {
    dispatch({ type: LOGIN_REQUEST });

    const API_KEY = "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

    const loginEndpoints = [
      { url: "https://2dc8ytsiog.execute-api.ap-south-1.amazonaws.com/dev/admin/login", role: "admin" },
      { url: "https://2dc8ytsiog.execute-api.ap-south-1.amazonaws.com/dev/manager/login", role: "manager" },
    ];

    for (const endpoint of loginEndpoints) {
      try {
        const response = await axios.post(
          endpoint.url,
          { username, password },
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        const { token, user, branches } = response.data;

        const userData = { ...user, role: endpoint.role, branches };

        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            userData,
          },
        });

        return; 
      } catch (err) {
       
        console.error(`Login failed for ${endpoint.role}`, err?.response?.data || err.message);
      }
    }

    dispatch({
      type: LOGIN_FAIL,
      payload: "Invalid username or password",
    });
  };
};

export const logout = () => {
  return (dispatch: any) => {
    localStorage.removeItem("selectedBranch")
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    dispatch({ type: LOGOUT });
  };
};


export const SET_SELECTED_BRANCH_IN_AUTH = "SET_SELECTED_BRANCH_IN_AUTH";

export const setSelectedBranchInAuth = (branchId: string) => {
  console.log("Selected branchId:", branchId); 

  
  return (dispatch: any) => {
    localStorage.setItem("selectedBranch", branchId);
    dispatch({
      type: SET_SELECTED_BRANCH_IN_AUTH,
      payload: branchId,
    });
  };
};